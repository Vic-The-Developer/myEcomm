const axios = require('axios').default;
require('dotenv').config();
const datetime = require('../middleware/timestamp');
const passkey = process.env.PASSKEY;
const shortcode = process.env.SHORTCODE;
const consumerkey = process.env.CONSUMERKEY;
const consumersecret = process.env.CONSUMERSECRET;

const newPassword = ()=>{
    const dt  = datetime.create();
    const formatted = dt.format('YmdHMS');
    const passString = shortcode + passkey + formatted;
    const base64EncodedPassword = Buffer.from(passString).toString('base64');
    return base64EncodedPassword;
}

exports.mpesaPassword = (req, res)=>{
    res.send(newPassword());
}

exports.token = ()=>{
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = 'Basic' +Buffer.from(consumerkey+ ':' +consumersecret).toString('base64');
    const headers = {
        Authorization: auth,
    }
    axios.get(url, {
        headers: headers
    }).then((response)=>{
        let data = response.data;
        let access_token = data.access_token;
        req.token = access_token;
        next();
    }).catch(err=>console.log(err));
}

exports.stkPush = (req, res)=>{
    const token = req.token;

    const headers = 'Bearer' +token;
    const sktURL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    let data2 = {
        timestamp : formatted,
        url : process.env.lipa_na_mpesa_url,
        BusinessShortCode : process.env.SHORTCODE,
        passkey : process.env.PASSKEY,
        password : newPassword(),
        transcation_type : "CustomerPayBillOnline",
        amount : "1", //you can enter any amount
        partyA : "party-sending-funds", //should follow the format:2547xxxxxxxx
        partyB : process.env.SHORTCODE,
        phoneNumber : "party-sending-funds", //should follow the format:2547xxxxxxxx
        callBackUrl : "your-ngrok-url/mpesa/lipa-na-mpesa-callback",
        accountReference : "Ecomm website",
        transaction_desc : "Lipa na Mpesa",
    }
    axios.post(sktURL, data2, {headers:headers}).then((response)=>res.send());
}

// class MpesaController {

//     async getOAuthToken(req,res,next){
//         let consumer_key = process.env.consumer_key;
//         let consumer_secret = process.env.consumer_secret;

//         let url = process.env.oauth_token_url;

//         //form a buffer of the consumer key and secret
//         let buffer = new Buffer.from(consumer_key+":"+consumer_secret);

//         let auth = `Basic ${buffer.toString('base64')}`;

//         try{

//             let {data} = await axios.get(url,{
//                 "headers":{
//                     "Authorization":auth
//                 }
//             });

//             req.token = data['access_token'];

//             return next();

//         }catch(err){

//             return res.send({
//                 success:false,
//                 message:err['response']['statusText']
//             });

//         }
        
        

        
        
//     };

//     async lipaNaMpesaOnline(req,res){
//         let token = req.token;
//         let auth = `Bearer ${token}`;
        

//         //getting the timestamp
//         let timestamp = require('../middleware/timestamp').timestamp;

//         let url = process.env.lipa_na_mpesa_url;
//         let bs_short_code = process.env.lipa_na_mpesa_shortcode;
//         let passkey = process.env.lipa_na_mpesa_passkey;

//         let password = new Buffer.from(`${bs_short_code}${passkey}${timestamp}`).toString('base64');
//         let transcation_type = "CustomerPayBillOnline";
//         let amount = "1"; //you can enter any amount
//         let partyA = "party-sending-funds"; //should follow the format:2547xxxxxxxx
//         let partyB = process.env.lipa_na_mpesa_shortcode;
//         let phoneNumber = "party-sending-funds"; //should follow the format:2547xxxxxxxx
//         let callBackUrl = "your-ngrok-url/mpesa/lipa-na-mpesa-callback";
//         let accountReference = "lipa-na-mpesa-tutorial";
//         let transaction_desc = "Testing lipa na mpesa functionality";

//         try {

//             let {data} = await axios.post(url,{
//                 "BusinessShortCode":bs_short_code,
//                 "Password":password,
//                 "Timestamp":timestamp,
//                 "TransactionType":transcation_type,
//                 "Amount":amount,
//                 "PartyA":partyA,
//                 "PartyB":partyB,
//                 "PhoneNumber":phoneNumber,
//                 "CallBackURL":callBackUrl,
//                 "AccountReference":accountReference,
//                 "TransactionDesc":transaction_desc
//             },{
//                 "headers":{
//                     "Authorization":auth
//                 }
//             }).catch(console.log);

//             return res.send({
//                 success:true,
//                 message:data
//             });

//         }catch(err){

//             return res.send({
//                 success:false,
//                 message:err['response']['statusText']
//             });

//         };
//     };

//     lipaNaMpesaOnlineCallback(req,res){

//         //Get the transaction description
//         let message = req.body.Body.stkCallback['ResultDesc'];

//         return res.send({
//             success:true,
//             message
//         });
        
//     };

// };

// module.exports = new MpesaController();