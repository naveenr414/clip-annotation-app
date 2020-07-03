export function titleCase(string: string) {
  var sentence = string.toLowerCase().split(" ");
  for (var i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    sentence[i] =
      sentence[i][0] === "("
        ? "(" + sentence[i][1].toUpperCase() + sentence[i].slice(2)
        : sentence[i];
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