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
      Authorization: "Bearer " + window.sessionStorage.getItem("token"),
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
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/entity/v1/new_entity");
  xhr.send(
    JSON.stringify({
      question_id: question_id,
      packet_id: packet_id,
      word_numbers: word_locations,
      entities: entity_list,
      user_id: window.sessionStorage.getItem("token"),
    })
  );
}

export function run_local(i: any, f: any) {
  return function () {
    f(i);
  };
}
