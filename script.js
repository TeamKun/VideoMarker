$(function () {
  let videoFileURL = null;
  const video = $("#videoPlayer").get(0);
  let originalMemoFileName = "memo";

  $(document).ready(function () {
    $(".memo-text").each(function () {
      autoResizeTextarea(this);
    });
  });

  $("#fileInput").on("change", function () {
    const file = this.files[0];
    if (file) {
      videoFileURL = URL.createObjectURL(file);
      $("#playSection").fadeIn();
    }
  });

  $("#memoInput").on("change", function () {
    const file = this.files[0];
    if (file && file.type === "text/plain") {
      originalMemoFileName = file.name.replace(/\.[^/.]+$/, "");
      const reader = new FileReader();
      reader.onload = function (e) {
        const lines = e.target.result.split("\n");
        $("#memoDisplay").empty();

        for (const lineRaw of lines) {
          const line = lineRaw.trim();

          // 'start' や空行は無視
          if (!line || line.toLowerCase() === "start") continue;

          // 正規表現で時間部分を抽出（スペースなしでもOK）
          const match = line.match(/^(\d{2}:\d{2}:\d{2})(.*)$/);
          if (match) {
            const time = match[1];
            const text = match[2].trim(); // テキストがあれば取得、なければ空文字
            const row = $(`
      <div class="memo-row">
        <input type="text" class="memo-time" value="${time}" />
        <textarea class="memo-text" placeholder="コメントを入力">${text}</textarea>
        <button class="jumpBtn memoBtn">▶</button>
        <button class="deleteBtn memoBtn">🗑</button>
      </div>
    `);
            $("#memoDisplay").append(row);
          }
        }

        $("#memoSection").fadeIn();
        $("#saveMemoBtn").show();
      };
      reader.readAsText(file);
    } else {
      alert("テキストファイル（.txt）を選択してください。");
    }
  });

  $("#saveMemoBtn").on("click", function () {
    const rows = $(".memo-row");
    const lines = [];

    rows.each(function () {
      const time = $(this).find(".memo-time").val().trim();
      const text = $(this).find(".memo-text").val().trim();
      if (time) {
        lines.push(`${time} ${text}`);
      }
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = $("<a>")
      .attr("href", url)
      .attr("download", `${originalMemoFileName}-edit.txt`)
      .appendTo("body");

    a[0].click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  $("#playButton").on("click", function () {
    $("#fileSection, #playSection").fadeOut(function () {
      $("#videoPlayer").attr("src", videoFileURL).fadeIn().get(0).play();
      $("#controlButtons").fadeIn();
      $("#memoSection").fadeIn();
      $("#timeMemoControl").fadeIn();
    });
  });

  $("#forward10Btn").on("click", function () {
    video.currentTime += 10;
  });

  $("#backward10Btn").on("click", function () {
    video.currentTime -= 10;
  });

  $("#forward1Btn").on("click", function () {
    video.currentTime += 1;
  });

  $("#backward1Btn").on("click", function () {
    video.currentTime -= 1;
  });

  $(document).on("click", ".jumpBtn", function () {
    const row = $(this).closest(".memo-row");
    const timeStr = row.find(".memo-time").val().trim();
    const seconds = timeStringToSeconds(timeStr);
    if (!isNaN(seconds)) {
      video.currentTime = seconds;
      video.play();
    } else {
      alert("時刻が正しくありません。例: 00:01:23");
    }
  });

  // 時刻フォーマット関数
  function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  $(document).on("click", ".deleteBtn", function () {
    $(this).closest(".memo-row").remove();
  });

  $("#addTimeMemoBtn").on("click", function () {
    const time = formatTime(video.currentTime);
    const row = $(`
      <div class="memo-row">
        <input type="text" class="memo-time" value="${time}"/>
        <textarea type="text" class="memo-text" placeholder="コメントを入力"></textarea>
        <button class="jumpBtn memoBtn">▶</button>
        <button class="deleteBtn memoBtn">🗑</button>
      </div>
    `);

    $("#memoDisplay").append(row);

    // ソート処理
    const rows = $(".memo-row").get();

    rows.sort(function (a, b) {
      const timeA = $(a).find(".memo-time").val();
      const timeB = $(b).find(".memo-time").val();
      return timeStringToSeconds(timeA) - timeStringToSeconds(timeB);
    });

    $("#memoDisplay").empty().append(rows);
  });
});

function timeStringToSeconds(t) {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

$(document).on("input", ".memo-text", function () {
  autoResizeTextarea(this);
});
