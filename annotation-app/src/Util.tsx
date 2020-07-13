export function titleCase(string: string) {
  if(string.length == 0) {
    return string;
  }
  var sentence = string.toLowerCase().split(" ");
  for (var i = 0; i < sentence.length; i++) {
    if(sentence[i].length == 0) {
      sentence[i] ="";
    }
    else {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
      sentence[i] =
        sentence[i][0] === "("
          ? "(" + sentence[i][1].toUpperCase() + sentence[i].slice(2)
          : sentence[i];
    }
  }
  return sentence.join(" ");
}

export function getUsername() {
  return fetch("/token/users/me", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + getCookie("token"),
    },
  })
    .then((res) => res.json())
    .then((result) => {
      return result;
    });
}

export function write_entities(
  question_id: number,
  packet_id: number,
  word_locations: number[][],
  entity_list: string[]
) {
  console.log(getCookie("token"));
  console.log(question_id);
  console.log(packet_id);
  console.log(word_locations);
  console.log(entity_list);
  
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/entity/v1/new_entity");
  xhr.send(
    JSON.stringify({
      question_id: question_id,
      packet_id: packet_id,
      word_numbers: word_locations,
      entities: entity_list,
      user_id: getCookie("token"),
    })
  );
}

export function run_local(i: any, f: any) {
  return function () {
    f(i);
  };
}

export function   setCookie(cname: string, cvalue: any, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

export function getCookie(cname: string) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function toNiceString(s: string): string {
    s = s.replace("_", " ");
    let nice_string = "";
    let i =0;
    while(i<s.length) {
        if(i+6<s.length && s.charAt(i) == '\\' && s.charAt(i+1) == 'u') {
            const num = parseInt(s.substring(i+2,i+6));
            nice_string+=String.fromCharCode(num);
            i+=6;
        }
        else {
            nice_string+=s.charAt(i);
            i+=1;
        }
    }
    return titleCase(nice_string);
}

export function toNormalString(s: string): string {
  s = s.replace(" ","_");
  s = s.toLowerCase();
  let new_string = "";
  for(var i = 0;i<s.length;i++) {
    if(s.charCodeAt(i)<255) {
      new_string+=s.charAt(i);
    }
    else {
      let hex = s.charCodeAt(i);
      new_string+="\\u"+("0000" + (hex).toString(16)).substr(-4);;
    }
  }
  
  return s;
}

export function escape_html(s: string): string {
  let t = "";
  for(var i = 0;i<s.length;i++) {
    if(s.charCodeAt(i)>255) {
      let hex = s.charCodeAt(i);
      t+="\\u"+("0000" + (hex).toString(16)).substr(-4);;
    }
    else {
      t+=s.charAt(i);
    }
  }
  return t;
}