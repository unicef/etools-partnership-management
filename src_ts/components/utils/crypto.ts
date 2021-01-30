const passcode = 'PASSWORD';

function encryptData(content: any) {
  content = JSON.stringify(content);
  var result = []; var passLen = passcode.length ;
  for(var i = 0  ; i < content.length ; i++) {
      var passOffset = i%passLen ;
      var calAscii = (content.charCodeAt(i)+passcode.charCodeAt(passOffset));
      result.push(calAscii);
  }
  return JSON.stringify(result) ;
}

function decryptData(content: any) {
  var result = [];var str = '';
  var codesArr = JSON.parse(content);var passLen = passcode.length ;
  for(var i = 0  ; i < codesArr.length ; i++) {
      var passOffset = i%passLen ;
      var calAscii = (codesArr[i]-passcode.charCodeAt(passOffset));
      result.push(calAscii) ;
  }
  for(var i = 0 ; i < result.length ; i++) {
      var ch = String.fromCharCode(result[i]); str += ch ;
  }
  return JSON.parse(str);
}

export const encryption = {
  encrypt: (values: any) => encryptData(values),
  decrypt: (data: any) => decryptData(data),
};
