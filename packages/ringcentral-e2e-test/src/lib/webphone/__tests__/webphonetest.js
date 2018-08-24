import webphone from '../index'

describe(
  '/ (webphone call pstn, set pstn automatic answering)',
  () => {
    it('test', async () => {
      console.log("creat webphone");
      let reswebphone = await webphone.createWebPhone('+18002119940','webphone','Test!123');
      console.log(JSON.parse(reswebphone.text));

      console.log("creat pstn");
      let respstn = await webphone.createWebPhone('+331861231','pstn','Test!123');
      console.log(JSON.parse(respstn.text));

      console.log("set pstn auto answer");
      let result1  = await webphone.preOperate_answerCall(JSON.parse(respstn.text)._id, JSON.parse(respstn.text).sessionId);

      console.log("webphone makecall");
      let result2 = await webphone.operate_makecall(JSON.parse(reswebphone.text)._id,JSON.parse(reswebphone.text).sessionId,JSON.parse(respstn.text).phoneNumber);

      webphone.sleep(50000);

      console.log("webphone hangup");
     let result3 = await webphone.operate_hangup(JSON.parse(reswebphone.text)._id,JSON.parse(reswebphone.text).sessionId,JSON.parse(respstn.text).phoneNumber);

      console.log("close");
      await webphone.operate_close(JSON.parse(reswebphone.text)._id,JSON.parse(reswebphone.text).sessionId,JSON.parse(reswebphone.text).phoneNumber);
      await webphone.operate_close(JSON.parse(respstn.text)._id,JSON.parse(respstn.text).sessionId,JSON.parse(respstn.text).phoneNumber);
    })
  },
  5000
)
