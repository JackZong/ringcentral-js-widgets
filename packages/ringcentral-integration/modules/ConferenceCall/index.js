import { Module } from '../../lib/di';
import callDirections from '../../enums/callDirections';
import RcModule from '../../lib/RcModule';
import actionTypes from './actionTypes';
import partyStatusCode from './partyStatusCode';
import getConferenceCallReducer from './getConferenceCallReducer';
import proxify from '../../lib/proxy/proxify';
import permissionsMessages from '../RolesAndPermissions/permissionsMessages';
import conferenceErrors from './conferenceCallErrors';
// import webphoneErrors from '../Webphone/webphoneErrors';
import ensureExist from '../../lib/ensureExist';
import callingModes from '../CallingSettings/callingModes';

const DEFAULT_TTL = 5000;
const DEFAULT_WAIT = 800;
const MAXIMUM_CAPACITY = 11;

/**
 * @class
 * @description ConferenceCall managing module
 */
@Module({
  deps: [
    'Auth',
    'Alert',
    {
      dep: 'Call',
      optional: true
    },
    'CallingSettings',
    'Client',
    'RolesAndPermissions',
    {
      dep: 'ConferenceCallOptions',
      optional: true
    },
  ]
})
export default class ConferenceCall extends RcModule {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {RegionSettings} params.regionSettings - regionSettings module instance
   * @param {Client} params.client - client module instance
   */
  constructor({
    auth,
    alert,
    call,
    callingSettings,
    client,
    rolesAndPermissions,
    pulling = true,
    ...options
  }) {
    super({
      auth,
      alert,
      call,
      callingSettings,
      client,
      rolesAndPermissions,
      pulling,
      ...options,
      actionTypes,
    });
    this._auth = this::ensureExist(auth, 'auth');
    this._alert = this::ensureExist(alert, 'alert');
    this._call = this::ensureExist(call, 'call');
    this._callingSettings = this::ensureExist(callingSettings, 'callingSettings');
    this._client = this::ensureExist(client, 'client');
    this._rolesAndPermissions = this::ensureExist(rolesAndPermissions, 'rolesAndPermissions');
    // we need the constructed actions
    this._reducer = getConferenceCallReducer(this.actionTypes);
    this._ttl = DEFAULT_TTL;
    this._timers = {};
    this._pulling = pulling;
    this._isMerging = false;
    this.capacity = MAXIMUM_CAPACITY;
  }

  // only can be used after webphone._onCallStartFunc
  isConferenceSession(sessionId) {
    return !!this.findConferenceWithSession(sessionId);
  }

  findConferenceWithSession(sessionId) {
    return Object.values(this.conferences).find(c => c.session.id === sessionId);
  }

  /**
   *
   * @param {string} id: conference id
   */
  @proxify
  async updateConferenceStatus(id) {
    this.store.dispatch({
      type: this.actionTypes.updateConference,
      conference: this.state.conferences[id],
    });
    try {
      const rawResponse = await this._client.service.platform()
        .get(`/account/~/telephony/sessions/${id}`);
      const response = rawResponse.json();
      const storedconference = this.state.conferences[response.id];
      const conference = Object.assign({}, storedconference.conference);
      conference.parties = response.parties;
      const {
        session
      } = storedconference;
      this.store.dispatch({
        type: this.actionTypes.updateConferenceSucceeded,
        conference,
        session
      });
    } catch (e) {
      // TODO: alert
      this.store.dispatch({
        type: this.actionTypes.updateConferenceFailed,
        conference: this.state.conferences[id],
        message: e.toString()
      });
      // need to propagate to out side try...catch block
      throw e;
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return this.state.conferences[id];
    }
  }

  /**
   * terminate a conference.
   * @param {string} id: conference id
   */
  @proxify
  async terminateConference(id) {
    this.store.dispatch({
      type: this.actionTypes.terminateConference,
      conference: this.state.conferences[id],
    });

    try {
      await this._client.service.platform()
        .delete(`/account/~/telephony/sessions/${id}`);
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceSucceeded,
        conference: this.state.conferences[id],
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
        message: e.toString()
      });
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return this.state.conferences[id];
    }
  }

  /**
   * Bring-in an outbound call into conference.
   * @param {string} id: conference id
   * @param {call} partyCall: get it from callMonitor.\w+Calls[\d+]
   * interface SessionData{
   *  "party-id": String,
   *  "session-id": String
   * }
   */
  @proxify
  async bringInToConference(id, partyCall, propagete = false) {
    const conference = this.state.conferences[id];
    if (
      !conference
        || !partyCall
        || partyCall.direction !== callDirections.outbound
        || conference.conference.parties.length >= MAXIMUM_CAPACITY
    ) {
      if (!propagete) {
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
      }

      return null;
    }
    this.store.dispatch({
      type: this.actionTypes.bringInConference,
      conference,
    });
    const sessionData = partyCall.webphoneSession.data;
    try {
      await this._client.service.platform()
        .post(`/account/~/telephony/sessions/${id}/parties/bring-in`, sessionData);
      await this.updateConferenceStatus(id);

      // let the contact match to do the matching of the parties.
      this.store.dispatch({
        type: this.actionTypes.bringInConferenceSucceeded,
        conference,
      });
      return id;
    } catch (e) {
      this.store.dispatch({
        type: this.actionTypes.bringInConferenceFailed,
        message: e.toString()
      });
      if (!propagete) {
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
        return null;
      }
      throw e;
    }
  }

  /**
   * remove a participant from conference.
   * @param {string} id: conference id
   * @param {SessionData} partyId: one participant's id of an conference's `parties` list
   */
  @proxify
  async removeFromConference(id, partyId) {
    this.store.dispatch({
      type: this.actionTypes.removeFromConference,
      conference: this.state.conferences[id],
    });

    try {
      await this._client.service.platform()
        .delete(`/account/~/telephony/sessions/${id}/parties/${partyId}`);
      await this.updateConferenceStatus(id);
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceSucceeded,
        conference: this.state.conferences[id],
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceFailed,
        message: e.toString()
      });
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return this.state.conferences[id];
    }
  }

  /**
   * start a conference call, return the session
   */
  @proxify
  async makeConference(propagate = false) {
    if (!this.ready) {
      return null;
    }
    if (!this._checkPermission()) {
      if (!propagate) {
        this._alert.danger({
          message: permissionsMessages.insufficientPrivilege,
          ttl: 0,
        });
      }

      return null;
    }
    if (!this._callingSettings.callingMode === callingModes.webphone) {
      if (!propagate) {
        this._alert.danger({
          message: conferenceErrors.modeError,
          ttl: 0,
        });
      }

      return null;
    }
    const session = await this._makeConference(propagate);
    return session;
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  async mergeToConference(calls = []) {
    this._isMerging = true;
    const conferenceState = Object.values(this.conferences)[0];
    try {
      if (conferenceState) {
        const conferenceId = conferenceState.conference.id;
        this.stopPollingConferenceStatus(conferenceId);
        await Promise.all(
          calls.map(
            call => this.bringInToConference(conferenceId, call, true)
          )
        );
        this.startPollingConferenceStatus(conferenceId);
        return conferenceId;
      }
      const { id } = await this.makeConference(true);
      /**
       * HACK: 700ms came from exprience, if we try to bring other calls into the conference
       * immediately, the api will throw 403 error which says: can't find the host of the
       * conference.
       */
      await new Promise(resolve => setTimeout(resolve, DEFAULT_WAIT));
      const mergedId = await this.mergeToConference(calls);

      // if create conference successfully but failed to bring-in, then terminate the conference.
      if (mergedId !== id) {
        this.terminateConference(id);
        return null;
      }
      return id;
    } catch (e) {
      this._alert.warning({
        message: conferenceErrors.bringInFailed,
      });
      return null;
    } finally {
      this._isMerging = false;
    }
  }

  async _makeConference(propagate = false) {
    try {
      this.store.dispatch({
        type: this.actionTypes.makeConference,
      });

      // TODO: replace with SDK function chaining calls
      const rawResponse = await this._client.service.platform()
        .post('/account/~/telephony/conference', {});
      const response = rawResponse.json();
      const conference = response.session;
      const phoneNumber = conference.voiceCallToken;
      // whether to mutate the session to mark the conference?
      const session = await this._call.call({
        phoneNumber
      }, true);

      if (typeof session === 'object' &&
        Object.prototype.toString.call(session.on).toLowerCase() === '[object function]') {
        this._hookConference(conference, session);

        this.store.dispatch({
          type: this.actionTypes.makeConferenceSucceeded,
          conference,
          session
        });
      } else {
        this.store.dispatch({
          type: this.actionTypes.makeConferenceFailed,
        });
      }

      return conference;
    } catch (e) {
      this.store.dispatch({
        type: this.actionTypes.makeConferenceFailed,
        message: e.toString()
      });

      if (!propagate) {
        this._alert.warning({
          message: conferenceErrors.makeConferenceFailed,
        });
        return null;
      }
      // need to propagate to out side try...catch block
      throw e;
    }
  }

  async _onStateChange() {
    if (this._shouldInit()) {
      this._init();
    } else if (this._shouldReset()) {
      this._reset();
    }
  }

  getOnlineParties(id) {
    const conferenceData = this.conferences[id];
    if (conferenceData) {
      return conferenceData.conference.parties.filter(
        p => p.status.code.toLowerCase() !== partyStatusCode.disconnected
      );
    }
    return null;
  }

  countOnlineParties(id) {
    const res = this.getOnlineParties(id);
    return Array.isArray(res) ? res.length : null;
  }

  isOverload(id) {
    return this.countOnlineParties(id) >= this.capacity;
  }

  async startPollingConferenceStatus(id) {
    if (this._timers[id] || !this._pulling) {
      return;
    }
    await this.updateConferenceStatus(id);
    this._timers[id] = setTimeout(
      async () => {
        await this.updateConferenceStatus(id);
        this.stopPollingConferenceStatus(id);
        if (this.conferences[id]) {
          this.startPollingConferenceStatus(id);
        }
      },
      this._ttl);
  }

  stopPollingConferenceStatus(id) {
    clearTimeout(this._timers[id]);
    delete this._timers[id];
  }

  openPulling() {
    this._pulling = true;
  }

  closePulling() {
    this._pulling = false;
  }

  togglePulling() {
    this._pulling = !this.pulling;
  }

  _init() {
    this.store.dispatch({
      type: this.actionTypes.initSuccess
    });
  }

  _reset() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess
    });
  }

  _shouldInit() {
    return (
      (this._auth.loggedIn && this._auth.ready) &&
      this._alert.ready &&
      this._callingSettings.ready &&
      this._call.ready &&
      this._rolesAndPermissions.ready &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (
        (!this._auth.loggedIn || !this._auth.ready)
        || !this._alert.ready
        || !this._callingSettings.ready
        || !this._call.ready
        || !this._rolesAndPermissions.ready
      ) &&
      this.ready
    );
  }

  _checkPermission() {
    if (!this._rolesAndPermissions.callingEnabled || !this._rolesAndPermissions.webphoneEnabled) {
      this._alert.danger({
        message: permissionsMessages.insufficientPrivilege,
        ttl: 0,
      });
      return false;
    }
    return true;
  }

  _hookConference(conference, session) {
    ['accepted'].forEach(
      evt => session.on(
        evt,
        () => this.startPollingConferenceStatus(conference.id)
      )
    );
    ['terminated', 'failed', 'rejected'].forEach(
      evt => session.on(evt, () => {
        this.store.dispatch({
          type: this.actionTypes.terminateConferenceSucceeded,
          conference,
        });
        this.stopPollingConferenceStatus(conference.id);
      })
    );
  }

  get status() {
    return this.state.status;
  }

  get conferences() {
    return this.state.conferences;
  }

  get conferenceCallStatus() {
    return this.state.conferenceCallStatus;
  }

  get isMerging() {
    return this._isMerging;
  }
}
