const { Telegraf, session, Extra, Markup, Scenes} = require('telegraf');
const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
const {enter, leave} = Stage
const stage = new Stage();
const axios = require('axios');
const Scene = BaseScene
const data = require('./data');
let db 


const  bot = new Telegraf(data.bot_token)
mongo.connect(data.mongoLink, {useUnifiedTopology: true}, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db('ABot'+data.bot_token.split(':')[0])
  bot.telegram.deleteWebhook().then(success => {
  success && console.log('🤖 is listening to your commands')
  bot.launch()
})
})

bot.use(session())
bot.use(stage.middleware())

const onCheck = new Scene('onCheck')
stage.register(onCheck)
const onConfirm = new Scene('onConfirm')
stage.register(onConfirm)
const getWallet= new Scene('getWallet')
stage.register(getWallet)

const getMsg = new Scene('getMsg')
stage.register(getMsg)

const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)

const channels = data.channelsList
const cb_api_key = data.cb_api_key
const cb_api_secret = data.cb_api_secret
const cb_account_id = data.cb_account_id
const admin = data.bot_admin
const bot_cur = data.currency
const min_wd = data.min_wd
const ref_bonus = data.reffer_bonus
const daily_bonus = data.daily_bonus
const paychanel = data.payment_channel


const Web3 = require('web3')
const Web3js = new Web3(new Web3.providers.HttpProvider("https://polygon-rpc.com/"))
const privateKey = data.privateKey
let tokenAddress = data.contractaddress
let fromAddress = data.address

let contractABI = [
   
   {
       'constant': false,
       'inputs': [
           {
               'name': '_to',
               'type': 'address'
           },
           {
               'name': '_value',
               'type': 'uint256'
           }
       ],
       'name': 'transfer',
       'outputs': [
           {
               'name': '',
               'type': 'bool'
           }
       ],
       'type': 'function'
   }
]



const botStart = async (ctx) => {
try {

if(ctx.message.chat.type != 'private'){
  return
  }
   let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()

let q1 = rndInt(1,10)
let q2 = rndInt(1,10)
let ans = q1+q2
  
  if(bData.length===0){
  if(ctx.startPayload && ctx.startPayload != ctx.from.id){
let ref = ctx.startPayload * 1
  db.collection('pendUsers').insertOne({userId: ctx.from.id, inviter: ref})}else{
db.collection('pendUsers').insertOne({userId: ctx.from.id})
}
  
  db.collection('allUsers').insertOne({userId: ctx.from.id, virgin: true, paid: false })
   db.collection('balance').insertOne({userId: ctx.from.id, balance:0,withdraw:0})
  db.collection('checkUsers').insertOne({userId: ctx.from.id, answer:ans})
 await  ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: '+q1+' + '+q2+' =\n*Send your answer now*',  { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
 ctx.scene.enter('onCheck')
 }else{
  let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dbData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '[🏠 Main Menu](https://twitter.com/airdrophyper)',
      { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '[🏠 Main Menu](https://twitter.com/airdrophyper)',
        { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
      }else{
  mustJoin(ctx)
  }}


} catch(e){
sendError(e, ctx)
}
}



bot.start(botStart)

bot.hears(['⬅️ Back','🔙 back'], botStart)


  
  
  

bot.hears('⚪️ Try Again', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){

let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
  
await ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: '+q1+' + '+q2+' =\nSend your answer now',  { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
starter(ctx)
return
}

  } catch (err) {
    sendError(err, ctx)
  }
})



onCheck.hears(['⚪️ Try Again','/start'], async (ctx) => {
 try {
 
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
ctx.scene.leave('onCheck')


let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
  
await ctx.replyWithMarkdown('➡️*Hi, before you start the bot, please prove you are human by answering the question below.*\nPlease answer: '+q1+' + '+q2+' =\nSend your answer now',  { reply_markup: { keyboard: [['⚪️ Try Again']], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
return
}
 } catch (err) {
    sendError(err, ctx)
  }
})  

onCheck.on('text', async (ctx) => {
 try {
 let dbData = await db.collection('checkUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
 let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let ans = dbData[0].answer*1
 
 
  if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
 
 if(!isNumeric(ctx.message.text)){
 ctx.replyWithMarkdown('😑 _I thought you were smarter than this, try again_ ')
 }else{
if(ctx.message.text==ans){
 db.collection('vUsers').insertOne({userId: ctx.from.id, answer:ans,name:valid})
 ctx.deleteMessage()
 
 ctx.scene.leave('onCheck')
 let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '[🏠 Main Menu](https://twitter.com/airdrophyper)',
      { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '[🏠 Main Menu](https://twitter.com/airdrophyper)',
        { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
  }else{
  mustJoin(ctx)
  }}else{
 ctx.replyWithMarkdown('🤓 _Wrong Answer! Please try again or Click ⚪️ Try Again to get another question_')
 }}
 } catch (err) {
    sendError(err, ctx)
  }
})  

bot.hears('🙌🏻 Invite', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
ctx.replyWithMarkdown(
  '*🙌🏻 User =* [' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id +')\n\n*🙌🏻 Your Invite Link = https://t.me/'+ctx.botInfo.username+'?start='+ctx.from.id+'\n\n*Total Invite -- '+ allRefs.length +'* \n\n🪢 Invite To Earn More*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Stat']], resize_keyboard: true } }
)} catch (err) {
    sendError(err, ctx)
  }
})

bot.command('broadcast', (ctx) => {
if(ctx.from.id==admin){
ctx.scene.enter('getMsg')}
})

getMsg.enter((ctx) => {
  ctx.replyWithMarkdown(
    ' *Okay Admin 👮‍♂, Send your broadcast message*', 
    { reply_markup: { keyboard: [['⬅️ Back']], resize_keyboard: true } }
  )
})

getMsg.leave((ctx) => starter(ctx))

getMsg.hears('⬅️ Back', (ctx) => {ctx.scene.leave('getMsg')})


getMsg.on('text', (ctx) => {
ctx.scene.leave('getMsg')

let postMessage = ctx.message.text
if(postMessage.length>3000){
return ctx.reply('Type in the message you want to sent to your subscribers. It may not exceed 3000 characters.')
}else{
globalBroadCast(ctx,admin)
}
})

async function globalBroadCast(ctx,userId){
let perRound = 100;
let totalBroadCast = 0;
let totalFail = 0;

let postMessage =ctx.message.text

let totalUsers = await db.collection('allUsers').find({}).toArray()

let noOfTotalUsers = totalUsers.length;
let lastUser = noOfTotalUsers - 1;

 for (let i = 0; i <= lastUser; i++) {
 setTimeout(function() {
      sendMessageToUser(userId, totalUsers[i].userId, postMessage, (i === lastUser), totalFail, totalUsers.length);
    }, (i * perRound));
  }
  return ctx.reply('Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: '+noOfTotalUsers)
}

function sendMessageToUser(publisherId, subscriberId, message, last, totalFail, totalUser) {
  bot.telegram.sendMessage(subscriberId, message,{parse_mode:'html'}).catch((e) => {
if(e == 'Forbidden: bot was block by the user'){
totalFail++
}
})
let totalSent = totalUser - totalFail

  if (last) {
    bot.telegram.sendMessage(publisherId, '<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> '+totalUser+'\n<b>Total Sent:</b> '+totalSent+'\n<b>Total Failed:</b> '+totalFail, {parse_mode:'html'});
  }
}
 
 



bot.hears('📊 Stat', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
  
  let time;
time = new Date();
time = time.toLocaleString();

bot.telegram.sendChatAction(ctx.from.id,'typing').catch((err) => sendError(err, ctx))
let dbData = await db.collection('vUsers').find({stat:"stat"}).toArray()
let dData = await db.collection('vUsers').find({}).toArray()

if(dbData.length===0){
db.collection('vUsers').insertOne({stat:"stat", value:0})
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+'`\n😇 *Total Payout:* `0.00000000 '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
return
}else{
let val = dbData[0].value*1
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+' users`\n😇 *Total Payout:* `'+val.toFixed(5)+' '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
}}
  catch (err) {
    sendError(err, ctx)
  }
})


bot.hears('🎁 Bonus', async (ctx) => {
try {

if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

var duration_in_hours;

var tin = new Date().toISOString();
let dData = await db.collection('bonusforUsers').find({userId: ctx.from.id}).toArray()

if(dData.length===0){
db.collection('bonusforUsers').insertOne({userId: ctx.from.id, bonus: new Date()})
duration_in_hours = 99;
}else{
 duration_in_hours = ((new Date()) - new Date(dData[0].bonus))/1000/60/60;
}



if(duration_in_hours>=24){

let bal = await db.collection('balance').find({userId: ctx.from.id}).toArray()


let ran = daily_bonus
let rann = ran*1
var adm = bal[0].balance*1
var addo = adm+rann

db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: addo}}, {upsert: true})

db.collection('bonusforUsers').updateOne({userId: ctx.from.id}, {$set: {bonus: tin}}, {upsert: true})

ctx.replyWithMarkdown('`✅ Today you received '+daily_bonus.toFixed(5)+' '+bot_cur+'`\n\n`Come back tomorrow and try again.This Is free Bonus 🎁`').catch((err) => sendError(err, ctx))
}else{
var duration_in_hour= Math.abs(duration_in_hours - 24);
var hours= Math.floor(duration_in_hour);
var minutes = Math.floor((duration_in_hour - hours)*60);
var seconds = Math.floor(((duration_in_hour - hours)*60-minutes)*60);
ctx.replyWithMarkdown('`❌ Bonus Adding Failed !\n\n💌 Come Back In: '+hours+':'+minutes+':'+seconds+' hrs`').catch((err) => sendError(err, ctx))

}
}  catch (err) {
    sendError(err, ctx)
  }
})


bot.hears('💰 Balance', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
  
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
   
ctx.replyWithMarkdown(
  '*🙌🏻 User = ' + ctx.from.first_name + '\n\n💰 Balance = '+sum.toFixed(5)+' '+bot_cur+'\n\n🪢 Invite To Earn More*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Stat' ]], resize_keyboard: true } }
)} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('🗂 Wallet', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
    ctx.replyWithMarkdown('💡 *Your SMT Address Is :* `'+ dbData[0].coinmail +'`',
   Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Address', 'iamsetemail')]
      ])
      )  
       .catch((err) => sendError(err, ctx))
    }else{
ctx.replyWithMarkdown('💡 *Your SMT Addresss is:* _not set_', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Address', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    }
} catch (err) {
    sendError(err, ctx)
  }
  
})

bot.action('iamsetemail', async (ctx) => {
  try {
  ctx.deleteMessage();
    ctx.replyWithMarkdown(
      '✏️ *Send now your SMT* to use it in future withdrawals!',{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
        .catch((err) => sendError(err, ctx))
        ctx.scene.enter('getWallet')
  } catch (err) {
    sendError(err, ctx)
  }
})

getWallet.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('getWallet')
})

getWallet.on('text', async(ctx) => {
try {
let msg = ctx.message.text
if(msg == '/start'){
ctx.scene.leave('getWallet')
starter(ctx)
}

 let email_test = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

 let check = await db.collection('allEmails').find({email:ctx.message.text}).toArray() // only not paid invited users
if(check.length===0){
ctx.replyWithMarkdown(
'🖊* Done:* Your new SMT Address is\n`'+ctx.message.text+'`',
{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true } }
  )  
   .catch((err) => sendError(err, ctx))
   db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id}) 
}else{
ctx.reply('Seems This Address have been used in bot before by another user! Try Again')
}

} catch (err) {
    sendError(err, ctx)
  }
})

bot.action('checkoo', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}


let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()

let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

  let joinCheck = await findUser(ctx)
  if(joinCheck){
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '[🏠 Main Menu](https://twitter.com/airdrophyper)',
      { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '[🏠 Main Menu](https://twitter.com/airdrophyper)',
        { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
  }else{
  mustJoin(ctx)
  }
} catch (err) {
    sendError(err, ctx)
  }
  
})
bot.hears('✅Done', async ctx=>{
  ctx.replyWithMarkdown(
    '[🏠 Main Menu](https://twitter.com/airdrophyper)',
    { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
    disable_web_page_preview : 'true'})

 })
// bot.hears('💳 Withdraw' ,async ctx => {
// ctx.reply('Bot budget Over')})
bot.hears('💳 Withdraw', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  
// let tgData = await bot.telegram.getChatMember(data.payment_channel, ctx.from.id) // user`s status on the channel

let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))

let bal = bData[0].balance

let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
if(bal>=min_wd){
var post="📤 *How many "+bot_cur+" you want to withdraw?*\n\n    *Minimum:* "+min_wd.toFixed(5)+" "+bot_cur+"\n    *Maximum:* "+bal.toFixed(5)+" "+bot_cur+"\n    _Maximum amount corresponds to your balance_\n\n    ➡* Send now the amount of  you want to withdraw*"

ctx.replyWithMarkdown(post, { reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})

ctx.scene.enter('onConfirm')
}else{
ctx.replyWithMarkdown("❌ *You have to own at least "+min_wd.toFixed(5)+" "+bot_cur+" in your balance to withdraw!*")
}
    }else{
    ctx.replyWithMarkdown('💡 *Your SMT Address is:* `not set`', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Wallet', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    
    }


} catch (err) {
    sendError(err, ctx)
  }
})
onConfirm.on('text' , async (ctx) => {
  if (ctx.message.text == '🔙 back'){
    // let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})
starter(ctx)
    ctx.scene.leave('onConfirm')

    return
    // ctx.scene.leave('onWithdraw')
  }else{
  let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
  let bal = bData[0].balance
var msggg = ctx.message.text*1
 db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: msggg}}, {upsert: true})
 let aeData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let walleet = aeData[0].coinmail

  if (bal>=min_wd){
    ctx.replyWithMarkdown('*Confirm with your withdraw.*\n *Withdraw Amount*= `'+ctx.message.text+'`\n*Your Wallet Address *:- `'+walleet+'`\n\n_If You enter wrong amount and address. Then admin will be not responsible for fund loss_' , {reply_markup : {inline_keyboard : [[
      {text : 'Confirm' , callback_data : 'Checko'},
      {text : 'Decline' , callback_data : 'Deco'}

    ]]}})
    ctx.scene.leave('onConfirm')

  }else{
  ctx.replyWithMarkdown("❌ *You have to own at least "+min_wd.toFixed(5)+" "+bot_cur+" in your balance to withdraw!*")
  } 
  
}})
bot.action('Deco' , async ctx => {
  ctx.scene.leave('onConfirm')
  let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
  db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})

  starter(ctx)
ctx.editMessageText('Your Withdraw Is Cancelled')
})
// bot.action('Checko' , ctx => {
//   ctx.scene.enter(onWithdraw)
// })


bot.action('Checko', async (ctx) => {
  // ctx.deleteMessage();
  let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
  let dbData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
  let bal = dbData[0].balance*1
let msg = dbDasta[0].withhamount
if((msg>bal) | ( msg<min_wd)){
  ctx.replyWithMarkdown("😐 Send a value over *"+min_wd.toFixed(5)+" "+bot_cur+"* but not greater than *"+bal.toFixed(5)+" "+bot_cur+"* ")
  return
   }
   if (bal >= min_wd && msg >= min_wd && msg <= bal) {


 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
let bData = await db.collection('withdrawal').find({userId: ctx.from.id}).toArray()
let dData = await db.collection('vUsers').find({stat: 'stat'}).toArray()
let vv = dData[0].value*1
let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()

 let ann = msg*1
 let bal = dbData[0].balance*1
let wd = dbDasta[0].withhamount
let rem = bal-ann
let ass = wd+ann
let sta = vv+ann
let wallet = aData[0].coinmail

db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})

  db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: rem, withdraw: ass}}, {upsert: true})
db.collection('vUsers').updateOne({stat: 'stat'}, {$set: {value: sta}}, {upsert: true})

let contract = new Web3js.eth.Contract(contractABI, tokenAddress, { from: fromAddress })
let amount = Web3js.utils.toHex(Web3js.utils.toWei("1")); 
let data = contract.methods.transfer(wallet, ann).encodeABI()
sendErcToken()
function sendErcToken() {
   let txObj = {
       gas: Web3js.utils.toHex(100000),
       "to": tokenAddress,
       "value": "0x00",
       "data": data,
       "from": fromAddress
   }
   Web3js.eth.accounts.signTransaction(txObj, privateKey, (err, signedTx) => {
       if (err) {
           return callback(err)
       } else {
           console.log(signedTx)
           return Web3js.eth.sendSignedTransaction(signedTx.rawTransaction, (err, res) => {
var paid = "<b>📇 New Withdraw Paid!\n➖➖➖➖➖➖➖➖➖➖➖\n👤 User:<a href='tg://user?id=" + ctx.from.id + "'>"+ctx.from.id+"</a>\n💵 Amount: "+msg+" "+bot_cur+"\n💳 Wallet: "+wallet+"\n➖➖➖➖➖➖➖➖➖➖➖\n🏧 Transaction Hash : <a href='https://polygonscan.com/tx/"+res+"'>" + res + "</a>\n➖➖➖➖➖➖➖➖➖➖➖</b>"
ctx.reply(paid,{parse_mode : "html" , disable_web_page_preview : true})

 let aData = db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = db.collection('balance').find({userId: ctx.from.id}).toArray()
  
const mesl = `<b>📇 New Withdraw Paid!</b>

👤 User: <a href='tg://user?id=` + ctx.from.id + `'>`+ctx.from.first_name+`</a>
<b>🧑🏻‍💻 User ID:</b> <code>${ctx.from.id}</code>
<b>💵 Amount::</b> <code>${msg}</code>
<b>💳 Wallet:</b> <code>${wallet}</code>
`
    ctx.replyWithMarkdown('📇 *Your withdraw has been requested✔️*\n\n_If you left any task you will not receive payment_\n')
      bot.telegram.sendMessage(data.payment_channel,mesl,{parse_mode: 'html',disable_webpage_preview:true}).catch((err) => sendError(err, ctx))
      
      .catch(error => {
    console.error(error)
    ctx.replyWithMarkdown('The Bot Has Encountred An Error While Completing Your Withdraw Request\nYour Problem Is Sent To Admin Youll Recieve Your Withdraw In 24 hours')
  })
  
  if (err) {

                   console.log(err)
               } else {
                   console.log(res)
               }
           })
       }
   })
}
           	

}else{
    ctx.replyWithMarkdown("😐 Send a value over *"+min_wd+" "+bot_cur+"* but not greater than *"+bal.toFixed(5)+" "+bot_cur+"* ")
   return
    }
})


function sendTransaction(ann,wallet,curp,ctx){
 
}
function rndFloat(min, max){
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max){
  return Math.floor(rndFloat(min, max))
}
  
  function mustJoin(ctx){
 
    msg ='*🔎Join our all channel*\n*➖➖➖➖➖➖➖➖➖➖➖*\n*@alwayspolite_updates*\n*➖➖➖➖➖➖➖➖➖➖➖*\n[🔰Follow Our Twiter Account](https://twitter.com/)\n[🔰Join Our Payout Channel](https://t.me/alwayspolite_updates)\n*➖➖➖➖➖➖➖➖➖➖➖*\n*🛃 Before Using This Bot!*', { parse_mode: 'markdown', disable_web_page_preview : 'true' , reply_markup: { inline_keyboard:[[{ text: "✅ Check", callback_data: "checkoo" }]]} }
  
  ctx.replyWithMarkdown(msg, { parse_mode: 'markdown', disable_web_page_preview : 'true' , reply_markup: { inline_keyboard:[[{ text: "✅ Check", callback_data: "checkoo" }]]} })
  }
 


function starter (ctx) {
  ctx.replyWithMarkdown(
    '[🏠 Main Menu](https://twitter.com/airdrophyper)',
    { reply_markup: { keyboard: [['💰 Balance'],['🙌🏻 Invite', '🎁 Bonus', '💳 Withdraw'], ['📊 Stat', '🗂 Wallet']], resize_keyboard: true }, 
    disable_web_page_preview : 'true'})

   }

function sendError (err, ctx) {
  console.log(err)
 bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUser(ctx){
let isInChannel= true;
let cha = data.channelsList
for (let i = 0; i < cha.length; i++) {
const chat = cha[i];
let tgData = await bot.telegram.getChatMember(chat, ctx.from.id)
  
  const sub = ['creator','adminstrator','member'].includes(tgData.status)
  if (!sub) {
    isInChannel = false;
    break;
  }
}
return isInChannel
}

/*

var findUser = (ctx) => {
var user = {user: ctx.from.id }
channels.every(isUser, user)
}


var isUser = (chat) => {
console.log(this)
console.log(chat)
/*l

let sub = 

return sub == true;
}
*/
