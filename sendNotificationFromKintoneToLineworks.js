/*
  Sends notification to Lineworks when kintone app data is updated.
  「
    〇〇さんがレコードを更新しました。
    レコード更新日時：YYYY/MM/dd HH:mm
    対象レコードURL：https://（サブドメイン名）.cybozu.com/k/（kintoneのアプリID）/show#record=（更新されたレコード番号）
  」
*/
(function () {
  "use strict";
  const LINEWORKS_API_URL =
    "https://apis.worksmobile.com/r/(API ID)/message/v1/bot/(bot No.)/message/push";
  const LINEWORKS_API_KEY = "(Server API Consumer Key)";
  const LINEWORKS_API_TOKEN = "(Server Token)";
  kintone.events.on(
    ["app.record.create.submit.success", "app.record.edit.submit.success"],
    (event) => {
      let record = event.record;
      let creatorEmail = record["作成者"].value.code;
      let editorName = record["更新者"].value.name;
      let editorEmail = record["更新者"].value.code;
      let editTime = new Date(record["更新日時"].value);
      editTime =
        editTime.getFullYear() +
        "/" +
        ("00" + (editTime.getMonth() + 1)).slice(-2) +
        "/" +
        ("00" + editTime.getDate()).slice(-2) +
        " " +
        ("00" + editTime.getHours()).slice(-2) +
        ":" +
        ("00" + editTime.getMinutes()).slice(-2);
      let recordURL =
        "https://(サブドメイン名).cybozu.com/k/" +
        kintone.app.getId() +
        "/show#record=" +
        record["レコード番号"].value;

      let sendBody = {
        accountId: creatorEmail,
        content: {
          type: "text",
          text:
            editorName +
            " さんがレコードを更新しました。\nレコード更新日時：" +
            editTime +
            "\n対象レコードURL：" +
            recordURL,
        },
      };
      function sendLineworks(key, token, json) {
        // header information for lineworks Server API
        let header = {
          "X-Cybozu-Authorization": "(kintoneアプリのAPIトークン)",
          Authorization: " Bearer " + token,
          consumerKey: key,
          "Content-Type": "application/json",
        };
        kintone.proxy(LINEWORKS_API_URL, "POST", header, json).then(
          (args) => {
            if (args[1] === 200) {
              alert("LINE WORKSにメッセージ送信完了");
              return true;
            } else {
              console.log(
                "LINE WORKSのメッセージ送信にエラーがありました！1\n" + args[0]
              );
              return false;
            }
          },
          function (error) {
            console.log(
              "LINE WORKSのメッセージ送信にエラーがありました！2\n" + error
            );
            return false;
          }
        );
      }
      if (editorEmail != creatorEmail) {
        console.log(creatorEmail + "にLINE WORKSメッセージ送信");
        sendLineworks(LINEWORKS_API_KEY, LINEWORKS_API_TOKEN, sendBody);
      }
    }
  );
})();
