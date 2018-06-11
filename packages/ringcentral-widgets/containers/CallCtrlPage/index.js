import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import formatNumber from 'ringcentral-integration/lib/formatNumber';
import callDirections from 'ringcentral-integration/enums/callDirections';

import CallCtrlPanel from '../../components/CallCtrlPanel';
import withPhone from '../../lib/withPhone';

import i18n from './i18n';

class CallCtrlPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMatcherIndex: 0,
      avatarUrl: null,
    };

    this.onSelectMatcherName = this.props.isOnConference
      ? (option) => {
        const nameMatches = this.props.nameMatches || [];
        let selectedMatcherIndex = nameMatches.findIndex(
          match => match.id === option.id
        );
        if (selectedMatcherIndex < 0) {
          selectedMatcherIndex = 0;
        }
        this.setState({
          selectedMatcherIndex,
          avatarUrl: null,
        });
        const contact = nameMatches[selectedMatcherIndex];
        if (contact) {
          this.props.updateSessionMatchedContact(this.props.session.id, contact);
          this.props.getAvatarUrl(contact).then((avatarUrl) => {
            this.setState({ avatarUrl });
          });
        }
      }
      : () => { };

    this.onMute = () =>
      this.props.onMute(this.props.session.id);
    this.onUnmute = () =>
      this.props.onUnmute(this.props.session.id);
    this.onHold = () =>
      this.props.onHold(this.props.session.id);
    this.onUnhold = () =>
      this.props.onUnhold(this.props.session.id);
    this.onRecord = () =>
      this.props.onRecord(this.props.session.id);
    this.onStopRecord = () =>
      this.props.onStopRecord(this.props.session.id);
    this.onHangup = () =>
      this.props.onHangup(this.props.session.id);
    this.onKeyPadChange = value =>
      this.props.sendDTMF(value, this.props.session.id);
    this.onFlip = value =>
      this.props.onFlip(value, this.props.session.id);
    this.onTransfer = value =>
      this.props.onTransfer(value, this.props.session.id);
    this.onPark = () =>
      this.props.onPark(this.props.session.id);
    this.gotoNormalCallCtrl = () => this.props.gotoNormalCallCtrl();

    if (this.props.sessionToMergeWith) {
      this.props.sessionToMergeWith.on('terminated', this.gotoNormalCallCtrl);
    }
  }

  componentDidMount() {
    this._mounted = true;
    this._updateAvatarAndMatchIndex(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.simple && nextProps.session.direction === callDirections.inbound) {
      nextProps.gotoNormalCallCtrl();
    }
    if (this.props.session.id !== nextProps.session.id) {
      this._updateAvatarAndMatchIndex(nextProps);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.props.sessionToMergeWith) {
      this.props.sessionToMergeWith.removeListener('terminated', this.gotoNormalCallCtrl);
    }
  }

  _updateAvatarAndMatchIndex(props) {
    let contact = props.session.contactMatch;
    let selectedMatcherIndex = 0;
    if (!contact) {
      contact = props.nameMatches && props.nameMatches[0];
    } else {
      selectedMatcherIndex = props.nameMatches.findIndex(match =>
        match.id === contact.id
      );
    }
    this.setState({
      selectedMatcherIndex,
      avatarUrl: null,
    });
    if (contact) {
      props.getAvatarUrl(contact).then((avatarUrl) => {
        if (!this._mounted) {
          return;
        }
        this.setState({ avatarUrl });
      });
    }
  }

  render() {
    const {
      session,
      gotoConferenceCallDialer,
      sessionToMergeWith,
      mergeToConference,
      setMergingFrom,
      setMergingTo,
      getSipInstance,
      isOnConference,
      getOnlineProfiles,
      simple,
      mergeDisabled,
      addDisabled
    } = this.props;
    if (!session.id) {
      return null;
    }
    const phoneNumber = session.direction === callDirections.outbound ?
      session.to : session.from;
    let fallbackUserName;
    if (session.direction === callDirections.inbound && session.from === 'anonymous') {
      fallbackUserName = i18n.getString('anonymous', this.props.currentLocale);
    }
    if (!fallbackUserName) {
      fallbackUserName = i18n.getString('unknown', this.props.currentLocale);
    }

    const mergeList = sessionToMergeWith
      ? [sessionToMergeWith, session]
      : [session];
    const backButtonLabel = this.props.backButtonLabel
      ? this.props.backButtonLabel
      : i18n.getString('activeCalls', this.props.currentLocale);

    return (
      <CallCtrlPanel
        setMergingFrom={isOnConference ? i => i : () => setMergingFrom(getSipInstance(session))}
        setMergingTo={() => setMergingTo(getSipInstance(session))}
        mergeToConference={() => mergeToConference(mergeList)}
        gotoConferenceCallDialer={() => gotoConferenceCallDialer()}
        direction={session.direction}
        addDisabled={addDisabled}
        mergeDisabled={mergeDisabled}
        simple={!!simple}
        getOnlineProfiles={getOnlineProfiles}
        isOnConference={isOnConference}
        conferenceData={this.props.conferenceData}
        backButtonLabel={backButtonLabel}
        currentLocale={this.props.currentLocale}
        formatPhone={this.props.formatPhone}
        phoneNumber={phoneNumber}
        sessionId={session.id}
        callStatus={session.callStatus}
        startTime={session.startTime}
        isOnMute={session.isOnMute}
        isOnHold={session.isOnHold}
        isOnFlip={session.isOnFlip}
        isOnTransfer={session.isOnTransfer}
        recordStatus={session.recordStatus}
        onBackButtonClick={this.props.onBackButtonClick}
        onMute={this.onMute}
        onUnmute={this.onUnmute}
        onHold={this.onHold}
        onUnhold={this.onUnhold}
        onRecord={this.onRecord}
        onStopRecord={this.onStopRecord}
        onKeyPadChange={this.onKeyPadChange}
        onHangup={this.onHangup}
        onAdd={this.props.onAdd}
        onFlip={this.onFlip}
        onTransfer={this.onTransfer}
        onPark={this.onPark}
        nameMatches={this.props.nameMatches}
        fallBackName={fallbackUserName}
        areaCode={this.props.areaCode}
        countryCode={this.props.countryCode}
        selectedMatcherIndex={this.state.selectedMatcherIndex}
        onSelectMatcherName={this.onSelectMatcherName}
        avatarUrl={this.state.avatarUrl}
        brand={this.props.brand}
        showContactDisplayPlaceholder={this.props.showContactDisplayPlaceholder}
        flipNumbers={this.props.flipNumbers}
        calls={this.props.calls}
        sourceIcons={this.props.sourceIcons}
        searchContactList={this.props.searchContactList}
        searchContact={this.props.searchContact}
        phoneTypeRenderer={this.props.phoneTypeRenderer}
        recipientsContactInfoRenderer={this.props.recipientsContactInfoRenderer}
        recipientsContactPhoneRenderer={this.props.recipientsContactPhoneRenderer}
        isMerging={this.props.isMerging}
      >
        {this.props.children}
      </CallCtrlPanel>
    );
  }
}

CallCtrlPage.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string,
    direction: PropTypes.string,
    startTime: PropTypes.number,
    isOnMute: PropTypes.bool,
    isOnHold: PropTypes.bool,
    isOnFlip: PropTypes.bool,
    isOnTransfer: PropTypes.bool,
    recordStatus: PropTypes.string,
    to: PropTypes.string,
    from: PropTypes.string,
    contactMatch: PropTypes.object,
  }).isRequired,
  getOnlineProfiles: PropTypes.func.isRequired,
  isOnConference: PropTypes.bool.isRequired,
  conferenceData: PropTypes.object,
  currentLocale: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onHangup: PropTypes.func.isRequired,
  sendDTMF: PropTypes.func.isRequired,
  formatPhone: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onFlip: PropTypes.func.isRequired,
  onPark: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  children: PropTypes.node,
  nameMatches: PropTypes.array.isRequired,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  getAvatarUrl: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  updateSessionMatchedContact: PropTypes.func.isRequired,
  backButtonLabel: PropTypes.string,
  brand: PropTypes.string.isRequired,
  showContactDisplayPlaceholder: PropTypes.bool.isRequired,
  flipNumbers: PropTypes.array.isRequired,
  calls: PropTypes.array.isRequired,
  sourceIcons: PropTypes.object,
  searchContactList: PropTypes.array.isRequired,
  searchContact: PropTypes.func.isRequired,
  phoneTypeRenderer: PropTypes.func,
  recipientsContactInfoRenderer: PropTypes.func,
  recipientsContactPhoneRenderer: PropTypes.func,
  simple: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  addDisabled: PropTypes.bool,
  gotoConferenceCallDialer: PropTypes.func,
  currentCall: PropTypes.object,
  sessionToMergeWith: PropTypes.object,
  mergeToConference: PropTypes.func,
  gotoNormalCallCtrl: PropTypes.func,
  isMerging: PropTypes.bool,
  setMergingFrom: PropTypes.func.isRequired,
  setMergingTo: PropTypes.func.isRequired,
  getSipInstance: PropTypes.func.isRequired,
};

CallCtrlPage.defaultProps = {
  children: undefined,
  backButtonLabel: null,
  sourceIcons: undefined,
  phoneTypeRenderer: undefined,
  recipientsContactInfoRenderer: undefined,
  recipientsContactPhoneRenderer: undefined,
  conferenceData: null,
  simple: null,
  mergeDisabled: false,
  addDisabled: false,
  gotoConferenceCallDialer: i => i,
  mergeToConference: i => i,
  currentCall: null,
  sessionToMergeWith: null,
  gotoNormalCallCtrl: i => i,
  isMerging: false,
};

function mapToProps(_, {
  phone: {
    webphone,
    locale,
    contactMatcher,
    regionSettings,
    brand,
    forwardingNumber,
    callMonitor,
    contactSearch,
    conferenceCall,
    routerInteraction,
  },
  simple,
}) {
  const currentSession = webphone.activeSession || {};
  const contactMapping = contactMatcher && contactMatcher.dataMapping;
  const fromMatches = (contactMapping && contactMapping[currentSession.from]) || [];
  const toMatches = (contactMapping && contactMapping[currentSession.to]) || [];
  const nameMatches =
    currentSession.direction === callDirections.outbound ? toMatches : fromMatches;
  const isOnConference = conferenceCall.isConferenceSession(currentSession.id);
  const conferenceData = Object.values(conferenceCall.conferences)[0];

  const currentCall = callMonitor.calls.find(call => (
    call.webphoneSession ? call.webphoneSession.id === currentSession.id : false
  ));

  let mergeDisabled = false;
  if (conferenceData) {
    mergeDisabled = conferenceCall.isOverload(conferenceData.conference.id);
  }
  // else if (!callMonitor.activeOnHoldCalls[0] || !currentCall) {
  //   mergeDisabled = true;
  //   // if (!callMonitor.activeOnHoldCalls[0]) {
  //   //   routerInteraction.push('/calls/active');
  //   // }
  // } else {
  //   mergeDisabled = false;
  // }

  let addDisabled = false;
  if (conferenceData) {
    addDisabled = conferenceCall.isOverload(conferenceData.conference.id);
  }
  // else if (!currentCall) {
  //   addDisabled = true;
  // }

  return {
    brand: brand.fullName,
    nameMatches,
    currentLocale: locale.currentLocale,
    currentCall,
    session: currentSession,
    areaCode: regionSettings.areaCode,
    countryCode: regionSettings.countryCode,
    flipNumbers: forwardingNumber.flipNumbers,
    calls: callMonitor.calls,
    searchContactList: contactSearch.sortedResult,
    isOnConference,
    conferenceData,
    mergeDisabled,
    addDisabled,
    simple,
    sessionToMergeWith: conferenceCall.state.mergingPair.from,
    routerInteraction,
    isMerging: conferenceCall.state.isMerging
  };
}

function mapToFunctions(_, {
  phone: {
    webphone,
    regionSettings,
    contactSearch,
    conferenceCall,
    routerInteraction,
  },
  getAvatarUrl,
  onBackButtonClick,
  onAdd,
  phoneTypeRenderer,
  recipientsContactInfoRenderer,
  recipientsContactPhoneRenderer,
}) {
  return {
    formatPhone: phoneNumber => formatNumber({
      phoneNumber,
      areaCode: regionSettings.areaCode,
      countryCode: regionSettings.countryCode,
    }),
    getOnlineProfiles: id => conferenceCall.getOnlinePartyProfiles(id),
    onHangup: sessionId => webphone.hangup(sessionId),
    onMute: sessionId => webphone.mute(sessionId),
    onUnmute: sessionId => webphone.unmute(sessionId),
    onHold: sessionId => webphone.hold(sessionId),
    onUnhold: sessionId => webphone.unhold(sessionId),
    onRecord: sessionId => webphone.startRecord(sessionId),
    onStopRecord: sessionId => webphone.stopRecord(sessionId),
    sendDTMF: (value, sessionId) => webphone.sendDTMF(value, sessionId),
    updateSessionMatchedContact: (sessionId, contact) =>
      webphone.updateSessionMatchedContact(sessionId, contact),
    getAvatarUrl,
    onBackButtonClick,
    onAdd,
    onFlip: (flipNumber, sessionId) => webphone.flip(flipNumber, sessionId),
    onTransfer: (transferNumber, sessionId) => webphone.transfer(transferNumber, sessionId),
    onPark: sessionId => webphone.park(sessionId),
    searchContact: searchString => (
      contactSearch.debouncedSearch({ searchString })
    ),
    phoneTypeRenderer,
    recipientsContactInfoRenderer,
    recipientsContactPhoneRenderer,
    gotoConferenceCallDialer: () => routerInteraction.push('/conferenceCall/dialer/'),
    gotoNormalCallCtrl: () => routerInteraction.push('/calls/active'),
    mergeToConference: webphoneSessions => conferenceCall.mergeToConference(webphoneSessions),
    setMergingFrom: from => conferenceCall.setMergeParty({ from }),
    setMergingTo: to => conferenceCall.setMergeParty({ to }),
    getSipInstance: session => webphone._sessions.get(session.id),
  };
}

const CallCtrlContainer = withPhone(connect(
  mapToProps,
  mapToFunctions,
)(CallCtrlPage));

CallCtrlContainer.propTypes = {
  getAvatarUrl: PropTypes.func,
  onBackButtonClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  backButtonLabel: PropTypes.string,
  children: PropTypes.node,
  showContactDisplayPlaceholder: PropTypes.bool,
  sourceIcons: PropTypes.object,
  isOnConference: PropTypes.bool,
  conferenceData: PropTypes.object,
};

CallCtrlContainer.defaultProps = {
  getAvatarUrl: () => null,
  showContactDisplayPlaceholder: false,
  children: undefined,
  sourceIcons: undefined,
  isOnConference: false,
  conferenceData: null,
};

export {
  mapToProps,
  mapToFunctions,
  CallCtrlPage,
  CallCtrlContainer as default,
};
