import fs from "fs"

function readAysnc(){
    return new Promise((resolve,reject)=>{
        fs.readFile("./","utf-8",(err,data)=>{
            
        })
    })
}

async function name() {
    const res = await readAysnc();

}
name();

import XMLHttpRequest from "xhr2"

function miniFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = "GET";
    xhr.open(method, url, true);

    Object.entries(options.headers || {}).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });
    xhr.onload = function () {
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        data: xhr.responseText,
      };
      resolve(response);
    };
    xhr.onerror = () => reject(new TypeError("Network error"));
    xhr.ontimeout = () => reject(new Error("Timeout"));
    try {
      xhr.send(options.body);
    } catch (error) {
      reject(error);
    }
  });
}

async function getData() {
  try {
    const res = await miniFetch("http://localhost:3001/room/lesson");
    console.log(res.data);
  } catch (error) {
    console.log("error", error);
  }
}

getData();

