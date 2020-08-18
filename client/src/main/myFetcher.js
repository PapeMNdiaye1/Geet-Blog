export const myFetcher = async (theUrl, theType, data) => {
  var dataToSend = await data;
  const rawResponse = await fetch(theUrl, {
    method: theType,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(dataToSend),
  });
  let response = await rawResponse.json();
  return response.UserLogin;
};
// ##############################################
export const myPostFetcher = async (theUrl, data) => {
  var dataToSend = await data;
  const rawResponse = await fetch(theUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(dataToSend),
  });
  let response = await rawResponse.json();
  return response;
};
// ###############################################################
export const myGetFetcher = async (TheUrl, theType) => {
  const rawResponse = await fetch(TheUrl, {
    method: theType,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  let response = await rawResponse.json();
  return response;
};
// ##############################################################
export const myDeleteFetcher = async (TheUrl) => {
  const rawResponse = fetch(TheUrl, {
    method: "delete",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  return rawResponse;
};
