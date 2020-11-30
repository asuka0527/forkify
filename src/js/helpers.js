// helpers.js file - central place for functions that we want to reuse everywhere in our project
import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

// FOR users with VERY BAD INTERNET CONNECTION
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          //data that we want to send
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} (${response.status})`);

    return data;
  } catch (err) {
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    // Make AJAX call -> store to a value
    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // response -> json -> return a promise -> save into a variable -> const data
    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} (${response.status})`);

    // resolved value of this getJSON -> promise
    return data;
  } catch (err) {
    // the promise that is being thrown inside getJSON will be reject -> so we can handle the error in the model
    // we propigated the error in this async function to -> async function in model.js
    throw err;
  }
};

// Sending data to the API so we could get through the API again

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //data that we want to send
      body: JSON.stringify(uploadData),
    });
    //
    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    //
    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} (${response.status})`);

    //
    return data;
  } catch (err) {
    //
    throw err;
  }
};
*/
