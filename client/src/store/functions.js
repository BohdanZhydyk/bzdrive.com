import axios from 'axios'
import cookies from 'js-cookie'


export const unixToDateTimeConverter = ( unix = new Date(Date.now()) )=>{
  let year = unix.getFullYear()
  let month = (unix.getMonth()+1) < 10 ? "0"+(unix.getMonth()+1) : unix.getMonth()+1
  let date = unix.getDate() < 10 ? "0"+unix.getDate() : unix.getDate()
  let hour = unix.getHours() < 10 ? "0"+unix.getHours() : unix.getHours()
  let min = unix.getMinutes() < 10 ? "0"+unix.getMinutes() : unix.getMinutes()
  let sec = unix.getSeconds() < 10 ? "0"+unix.getSeconds() : unix.getSeconds()
  let dateTime = `${year}-${month}-${date} ${hour}:${min}:${sec}`
  return dateTime
}
export const unixToDateConverter = ( unix = new Date(Date.now()) )=>{
  let year = unix.getFullYear()
  let month = (unix.getMonth()+1) < 10 ? "0"+(unix.getMonth()+1) : unix.getMonth()+1
  let date = unix.getDate() < 10 ? "0"+unix.getDate() : unix.getDate()
  let dateTime = `${date}.${month}.${year}`
  return dateTime
}
export const unixToTimeConverter = ( unix = new Date(Date.now()) )=>{
  let hour = unix.getHours() < 10 ? "0"+unix.getHours() : unix.getHours()
  let min = unix.getMinutes() < 10 ? "0"+unix.getMinutes() : unix.getMinutes()
  let sec = unix.getSeconds() < 10 ? "0"+unix.getSeconds() : unix.getSeconds()
  let dateTime = `${hour}:${min}:${sec}`
  return dateTime
}
export const unixToYearMonthConverter = ( unix = new Date(Date.now()) )=>{
  let year = unix.getFullYear()
  let month = (unix.getMonth()+1) < 10 ? "0"+(unix.getMonth()+1) : unix.getMonth()+1
  let dateTime = `${year}/${month}`
  return dateTime
}

export const bzCalc = (operation, a, b)=>{
  switch(operation){
    case "+": return( (parseFloat(a) + parseFloat(b)).toFixed(2) )
    case "-": return( (parseFloat(a) - parseFloat(b)).toFixed(2) )
    case "*": return( (parseFloat(a) * parseFloat(b)).toFixed(2) )
    case "/": return( (parseFloat(a) / parseFloat(b)).toFixed(2) )
    case "VAT":
      let one = (parseFloat(a) * parseFloat(b)).toFixed(2)
      let two = (parseFloat(one) / parseFloat(100)).toFixed(2)
      let three = (parseFloat(a) - parseFloat(two)).toFixed(2)
      return three
    default: break
  }
}

export const bzIntToWord = (int)=>{

  if(!int) return ""

  let liczba = parseInt( int.split('.')[0] )
  let grosze = int.split('.')[1]

  let jednosci = ["","jeden","dwa","trzy","cztery","pięć","sześć","siedem","osiem","dziewięć"]
  let nascie = ["","jedenaście","dwanaście","trzynaście","czternaście","piętnaście","szesnaście","siedemnaście","osiemnaście","dziewietnaście"]
  let dziesiatki = ["","dziesięć","dwadzieścia","trzydzieści","czterdzieści","pięćdziesiąt","sześćdziesiąt","siedemdziesiąt","osiemdziesiąt","dziewięćdziesiąt"]
  let setki = ["","sto","dwieście","trzysta","czterysta","pięćset","sześćset","siedemset","osiemset","dziewięćset"]
  let grupy = [
    ["" ,"" ,""],
    ["tysiąc" ,"tysiące" ,"tysięcy"],
    ["milion" ,"miliony" ,"milionów"],
    ["miliard","miliardy","miliardów"],
    ["bilion" ,"biliony" ,"bilionów"],
    ["biliard","biliardy","biliardów"],
    ["trylion","tryliony","trylionów"]
  ]
    
  let wynik = '', znak = ''

  if( liczba === 0 ){ wynik = "zero" }
  if( liczba < 0 ){ znak = "minus"; liczba = -liczba; }
          
  let g = 0
  while( liczba > 0 ){
    let s = Math.floor((liczba % 1000)/100)
    let n = 0
    let d = Math.floor((liczba % 100)/10)
    let j = Math.floor(liczba % 10)
          
    if( d === 1 && j>0 ){ n = j; d = 0; j = 0; }

    let k = 2
    if( j === 1 && s+d+n === 0 ){ k = 0 }
    if( j === 2 || j === 3 || j === 4 ){ k = 1 }
    if( s+d+n+j > 0 ){ wynik = `${setki[s]} ${dziesiatki[d]} ${nascie[n]} ${jednosci[j]} ${grupy[g][k]} ${wynik}` }

    g++
    liczba = Math.floor(liczba/1000)
  }

  return(`${znak} ${wynik} ${`zł`} ${grosze}/100`);
}

export const setToken = (bzToken)=> cookies.set('bzToken', bzToken )
export const remToken = ()=> cookies.remove('bzToken')
export const getToken = ()=> cookies.get('bzToken')

export const setUser = (user)=> JSON.stringify( cookies.set('user', user) )
export const remUser = ()=> cookies.remove('user')
export const getUser = ()=> cookies.get('user') ? JSON.parse( cookies.get('user') ) : false


export const errors = (err)=> console.log("ERRORS", err)


export const bzPost = async ( link, object, callback )=>{

  let OutData = {
    Errors: [],
    link: link,
    bzToken: getToken(),
    IP: false,
    user: false,
    object: object
  }

  // let href = window.location.href
  let hostname = window.location.hostname

  let api

  hostname === 'localhost'
  ? api = 'http://localhost:5000'
  : api = 'https://bzdrive.com'

  OutData.IP = await axios.get('https://json.geoiplookup.io').then( (res)=> {

    return {
      host: hostname,
      from: link,
      ip: res.data.ip,
      postal_code: res.data.postal_code,
      country_code: res.data.country_code,
      country_name: res.data.country_name,
      region: res.data.region,
      city: res.data.city,
      asn_org: res.data.asn_org
      //isp:org:hostname:latitude:longitude:continent_code:continent_name:district:timezone_name:
      //connection_type:asn_number:asn:currency_code:currency_name:success:premium: 
    }

  }).catch( (err)=>{
    OutData.Errors.push({err:err, host:hostname, from:link})
    return "no IP"
  })

  axios.post( api, OutData).then( (res)=>{

    setToken(res.data.bzToken)
    setUser(res.data.user)
    res.data.Errors.map( (err)=> errors(err) )

    callback(res.data.serverData)

  }).catch( (err)=> errors(err) )


}
