const http = require('http');

async function fetch_json(url: string) {
  let data = new Promise<Object>((resolve, reject) => {
    http.get(url, (res) => {

      if (res.statusCode != 200){
        reject('error fetching data');
      }

      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {rawData = rawData+ chunk});
      res.on('end', () => {
        resolve(JSON.parse(rawData));
      })
    });
  });
  

  
  return await data;
}

export async function fetchUrls(options?: {inspectPort?: number, chromePort?: number, ip?:string}){
  let inspectPort = options?.inspectPort??9229;
  let chromePort = options?.chromePort??9222;
  let ip = options?.ip??"127.0.0.1";

  let inspectURL : string|undefined;
  let chromeURL: string|undefined;

  let parsed = await fetch_json(`http://${ip}:${inspectPort}/json/list`);
  
  inspectURL= parsed[0].webSocketDebuggerUrl;
  
  

  let chrome = await fetch_json(`http://${ip}:${chromePort}/json/version`);
  chromeURL = chrome.webSocketDebuggerUrl;

  return {inspectURL, chromeURL}
}
