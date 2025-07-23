// --- Timeline Form/JSON Builder Logic ---
let stages = [];
let config = {
  majorBgColor: "#e0e7ef",
  typeMap: {},
};

function maskDateInput(input) {
  let val = input.value.replace(/[^\d]/g, "");
  if (val.length > 8) val = val.slice(0, 8);
  input.value = val;
}
function formatDateInput(val) {
  if (!val || val.length !== 8) return "";
  const y = val.substring(0, 4);
  const m = val.substring(4, 6);
  const d = val.substring(6, 8);
  return `${y}-${m}-${d}`;
}
function unformatDateInput(val) {
  if (!val || val.length !== 10) return "";
  return val.replace(/-/g, "");
}
function renderStages() {
  // Set config UI values
  document.getElementById("majorBgColor").value =
    config.majorBgColor || "#e0e7ef";
  const stagesDiv = document.getElementById("stages");
  stagesDiv.innerHTML = "";
  stages.forEach((stage, i) => {
    const stageDiv = document.createElement("div");
    stageDiv.className = "stage" + (stage.collapsed ? " collapsed" : "");
    const header = document.createElement("div");
    header.className = "stage-header";
    header.style.cursor = "pointer";
    header.innerHTML = `
            <span style="display:flex; align-items:center; gap: 4px;">
                <span class="dropdown-icon"> 
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="stage-title">${
                  stage.stage || "Untitled Stage"
                }</span>
            </span>
            <span>
                <button type="button" class="btn btn-move" title="Move Up" style="padding:2px 6px; font-size:14px;${
                  i === 0 ? "cursor:not-allowed;" : ""
                }" onclick="event.stopPropagation();moveStage(${i},-1)" ${
      i === 0 ? "disabled" : ""
    }>&uarr;</button>
                <button type="button" class="btn btn-move" title="Move Down" style="padding:2px 6px; font-size:14px;${
                  i === stages.length - 1 ? "cursor:not-allowed;" : ""
                }" onclick="event.stopPropagation();moveStage(${i},1)" ${
      i === stages.length - 1 ? "disabled" : ""
    }>&darr;</button>
                <button type="button" class="btn btn-add" onclick="event.stopPropagation();addTimelineItem(${i})">+ Timeline Item</button>
                <button type="button" class="btn btn-remove" onclick="event.stopPropagation();removeStage(${i})">Remove</button>
            </span>
        `;
    header.onclick = function () {
      toggleStage(i);
    };
    stageDiv.appendChild(header);
    if (!stage.collapsed) {
      const details = document.createElement("div");
      details.style.padding = "8px 16px";
      details.innerHTML = `
                <div class="form-row">
                    <label>Stage Name:</label>
                    <input type="text" value="${
                      stage.stage
                    }" onchange="updateStageName(${i}, this.value)">
                </div>
                <div class="form-row">
                    <label>Description:</label>
                    <input type="text" value="${
                      stage.desc || ""
                    }" onchange="updateStageDesc(${i}, this.value)">
                </div>
            `;
      stageDiv.appendChild(details);
      const itemsDiv = document.createElement("div");
      itemsDiv.className = "timeline-items";
      stage.items.forEach((item, j) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "timeline-item";
        // Build type select options
        let typeOptions = `<option ${item.type ? "" : "selected"}>--</option>`;
        for (const type in config.typeMap) {
          typeOptions += `<option value="${type}"${
            item.type === type ? " selected" : ""
          }>${type}</option>`;
        }
        itemDiv.innerHTML = `
                    <div class="timeline-item-row vertical-fields">
                        <div class="field-group">
                            <label>Name</label>
                            <input type="text" value="${
                              item.name
                            }" onchange="updateTimelineItem(${i},${j},'name',this.value)">
                        </div>
                        <div class="field-group">
                            <label>Date Range</label>
                            <input type="text" class="item-date-range" data-stage="${i}" data-item="${j}" placeholder="YYYYMMDD - YYYYMMDD">
                            <span style="display: none">
                              <span>or</span>
                              <input type="text" class="date-field" value="${
                                item.start
                              }" maxlength="8" placeholder="YYYYMMDD" pattern="\\d{8}" style="width:90px;" oninput="maskDateInput(this)" onchange="updateTimelineItem(${i},${j},'start',this.value)">
                              <span>to</span>
                              <input type="text" class="date-field" value="${
                                item.end
                              }" maxlength="8" placeholder="YYYYMMDD" pattern="\\d{8}" style="width:90px;" oninput="maskDateInput(this)" onchange="updateTimelineItem(${i},${j},'end',this.value)">
                            </span>
                        </div>
                        <div class="field-group">
                            <label>Type</label>
                            <select onchange="updateTimelineItem(${i},${j},'type',this.value)" style="width:100%; min-width:80px; font-size:13px; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1; height:26px; background:#fff; color:#334155;">
                              ${typeOptions}
                            </select>
                        </div>
                        <div class="field-group checkbox-field">
                          <label for="critical-${i}-${j}" style="white-space:nowrap;">Critical Path</label>
                          <input type="checkbox" id="critical-${i}-${j}" ${
          item.critical ? "checked" : ""
        } onchange="updateTimelineItem(${i},${j},'critical',this.checked)">
                        </div>
                        <div style="display:flex; gap:4px; align-items:center; margin-top:4px;">
                            <button type="button" class="btn btn-move" title="Move Up" style="padding:2px 6px; font-size:14px;${
                              j === 0 ? "cursor:not-allowed;" : ""
                            }" onclick="moveTimelineItem(${i},${j},-1)" ${
          j === 0 ? "disabled" : ""
        }>&uarr;</button>
                            <button type="button" class="btn btn-move" title="Move Down" style="padding:2px 6px; font-size:14px;${
                              j === stage.items.length - 1
                                ? "cursor:not-allowed;"
                                : ""
                            }" onclick="moveTimelineItem(${i},${j},1)" ${
          j === stage.items.length - 1 ? "disabled" : ""
        }>&darr;</button>
                            <button type="button" class="btn btn-remove" onclick="removeTimelineItem(${i},${j})">Remove</button>
                        </div>
                    </div>
                `;
        itemsDiv.appendChild(itemDiv);
      });
      stageDiv.appendChild(itemsDiv);
    }
    // Move stage up/down
    window.moveStage = function (idx, dir) {
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= stages.length) return;
      const temp = stages[idx];
      stages[idx] = stages[newIdx];
      stages[newIdx] = temp;
      renderStages();
    };

    // Move timeline item up/down
    window.moveTimelineItem = function (stageIdx, itemIdx, dir) {
      const items = stages[stageIdx].items;
      const newIdx = itemIdx + dir;
      if (newIdx < 0 || newIdx >= items.length) return;
      const temp = items[itemIdx];
      items[itemIdx] = items[newIdx];
      items[newIdx] = temp;
      renderStages();
    };
    stagesDiv.appendChild(stageDiv);
  });
  // --- Date Range Picker Integration ---
  $(function () {
    // Project Date Range Picker
    $("#projectDateRange").daterangepicker({
      autoUpdateInput: false,
      locale: {
        format: "YYYYMMDD",
        separator: " - ",
      },
    });
    $("#projectDateRange").on("apply.daterangepicker", function (ev, picker) {
      $(this).val(
        picker.startDate.format("YYYYMMDD") +
          " - " +
          picker.endDate.format("YYYYMMDD")
      );
      $("#projectStart").val(picker.startDate.format("YYYYMMDD"));
      $("#projectEnd").val(picker.endDate.format("YYYYMMDD"));
    });
    $("#projectDateRange").on("cancel.daterangepicker", function (ev, picker) {
      $(this).val("");
    });
    // Sync manual input to range picker
    var start = $("#projectStart").val();
    var end = $("#projectEnd").val();
    if (start.length === 8 && end.length === 8) {
      $("#projectDateRange").val(start + " - " + end);
    }

    // Timeline Item Date Range Pickers
    $(".item-date-range").each(function () {
      var $range = $(this);

      var $range = $(this);
      var parent = $range.parent();
      var startInput = parent.find("input.date-field").eq(0);
      var endInput = parent.find("input.date-field").eq(1);
      if (startInput.val().length === 8 && endInput.val().length === 8) {
        $range.val(startInput.val() + " - " + endInput.val());
      }

      var i = $range.data("stage");
      var j = $range.data("item");
      $range.daterangepicker({
        autoUpdateInput: false,
        locale: {
          format: "YYYYMMDD",
          separator: " - ",
          startDate: startInput.val() || "",
          endDate: endInput.val() || "",
        },
      });
      $range.on("apply.daterangepicker", function (ev, picker) {
        $range.val(
          picker.startDate.format("YYYYMMDD") +
            " - " +
            picker.endDate.format("YYYYMMDD")
        );
        var parent = $range.parent();
        var startInput = parent.find("input.date-field").eq(0);
        var endInput = parent.find("input.date-field").eq(1);
        startInput.val(picker.startDate.format("YYYYMMDD"));
        endInput.val(picker.endDate.format("YYYYMMDD"));
        updateTimelineItem(i, j, "start", picker.startDate.format("YYYYMMDD"));
        updateTimelineItem(i, j, "end", picker.endDate.format("YYYYMMDD"));
      });
      $range.on("cancel.daterangepicker", function (ev, picker) {
        $range.val("");
      });
    });
  });
}
window.addStage = function () {
  stages.push({ stage: "", desc: "", items: [], collapsed: false });
  renderStages();
};
window.removeStage = function (i) {
  stages.splice(i, 1);
  renderStages();
};
window.toggleStage = function (i) {
  stages[i].collapsed = !stages[i].collapsed;
  renderStages();
};
window.updateStageName = function (i, val) {
  stages[i].stage = val;
};
window.updateStageDesc = function (i, val) {
  stages[i].desc = val;
};
window.addTimelineItem = function (i) {
  // Default to first type in config
  const firstType = Object.keys(config.typeMap)[0] || "";
  stages[i].items.push({ name: "", start: "", end: "", type: firstType });
  renderStages();
};
window.removeTimelineItem = function (i, j) {
  stages[i].items.splice(j, 1);
  renderStages();
};
window.updateTimelineItem = function (i, j, field, val) {
  stages[i].items[j][field] = val;
};

document.getElementById("addStageBtn").onclick = addStage;
document.getElementById("cancelBtn").onclick = function () {
  if (confirm("Discard all changes?")) {
    document.getElementById("timelineForm").reset();
    stages = [];
    renderStages();
  }
};
document.getElementById("saveBtn").onclick = function () {
  const projectStartRaw = document.getElementById("projectStart").value;
  const projectEndRaw = document.getElementById("projectEnd").value;
  const projectStart = formatDateInput(projectStartRaw);
  const projectEnd = formatDateInput(projectEndRaw);
  const output = {
    basic: { projectStart, projectEnd },
    config: {
      majorBgColor: config.majorBgColor,
      typeMap: config.typeMap,
    },
    stages: stages.map((s) => ({
      stage: s.stage,
      desc: s.desc,
      items: s.items.map((it) => ({
        name: it.name,
        start: formatDateInput(it.start),
        end: formatDateInput(it.end),
        type: it.type || Object.keys(config.typeMap)[0] || "",
        isCritical: !!it.critical,
      })),
    })),
  };
  document.getElementById("jsonOutput").value = JSON.stringify(output, null, 2);
  document.getElementById("popup").style.display = "flex";
};
document.getElementById("closePopupBtn").onclick = function () {
  document.getElementById("popup").style.display = "none";
};

document.getElementById("saveJsonBtn").onclick = async function () {
  const json = document.getElementById("jsonOutput").value;
  // Check if File System Access API is available
  if (window.showSaveFilePicker) {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
        now.getDate()
      )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(
        now.getSeconds()
      )}`;
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `timeline_${timestamp}.json`,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (e) {
      console.log("File save cancelled or failed:", e);
    }
  } else {
    // fallback for browsers without File System Access API
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    link.download = `timeline_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- Import JSON Popup Logic ---
document.getElementById("openImportJsonPopupBtn").onclick = function () {
  document.getElementById("importJsonPopup").style.display = "flex";
  document.getElementById("jsonInput").value = "";
  document.getElementById("jsonError").style.display = "none";
  if (document.getElementById("jsonFileInput")) {
    document.getElementById("jsonFileInput").value = "";
  }
};
// File upload for JSON
var jsonFileInput = document.getElementById("jsonFileInput");
if (jsonFileInput) {
  jsonFileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      document.getElementById("jsonInput").value = evt.target.result;
    };
    reader.onerror = function () {
      document.getElementById("jsonError").textContent = "Failed to read file.";
      document.getElementById("jsonError").style.display = "block";
    };
    reader.readAsText(file);
  });
}
document.getElementById("closeImportJsonPopupBtn").onclick = function () {
  document.getElementById("importJsonPopup").style.display = "none";
};
document.getElementById("loadJsonToForm").onclick = function () {
  const jsonInput = document.getElementById("jsonInput").value.trim();
  if (!jsonInput) {
    document.getElementById("jsonError").textContent = "Please enter JSON data";
    document.getElementById("jsonError").style.display = "block";
    return;
  }
  try {
    const obj = JSON.parse(jsonInput);
    document.getElementById("jsonError").style.display = "none";
    document.getElementById("projectStart").value = unformatDateInput(
      obj.basic && obj.basic.projectStart
    );
    document.getElementById("projectEnd").value = unformatDateInput(
      obj.basic && obj.basic.projectEnd
    );
    document.getElementById("projectDateRange").value =
      document.getElementById("projectStart").value +
      " - " +
      document.getElementById("projectEnd").value;
    // Load config (if present, update; if missing, keep existing config)
    if (obj.config && typeof obj.config === "object") {
      if ("majorBgColor" in obj.config)
        config.majorBgColor = obj.config.majorBgColor;
      if ("typeMap" in obj.config) config.typeMap = obj.config.typeMap;
    }
    stages = (obj.stages || []).map((s) => ({
      stage: s.stage,
      desc: s.desc || "",
      items: (s.items || []).map((it) => ({
        name: it.name,
        start: unformatDateInput(it.start),
        end: unformatDateInput(it.end),
        type: typeof it.type === "string" ? it.type : "",
        critical: !!(it.isCritical || it.critical),
      })),
      collapsed: false,
    }));
    renderStages();
    renderTypeList && renderTypeList();
    document.getElementById("importJsonPopup").style.display = "none";
  } catch (e) {
    document.getElementById("jsonError").textContent =
      "Invalid JSON: " + e.message;
    document.getElementById("jsonError").style.display = "block";
  }
};

// --- Timeline Preview Logic ---
const mMonth = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};
function getTimelineStructure(projectStart, projectEnd) {
  const startDateArray = projectStart.split("-");
  const endDateArray = projectEnd.split("-");
  let startDate = new Date(
    startDateArray[0],
    startDateArray[1] - 1,
    startDateArray[2]
  );
  let endDate = new Date(endDateArray[0], endDateArray[1] - 1, endDateArray[2]);
  const getQuarterByMonth = (month) => Math.floor((month - 1) / 3) + 1;
  const getQuarterMonth = (quarter, type = 1) =>
    type === 1 ? (quarter - 1) * 3 + 1 : quarter * 3;
  const getTimelineArray = (projectStart, projectEnd) => {
    const result = [];
    const start = new Date(projectStart);
    const end = new Date(projectEnd);
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const quarter = Math.floor((month - 1) / 3) + 1;
      const day = new Date(year, month, 0).getDate();
      result.push({ year, quarter, month, day });
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    return result;
  };
  return getTimelineArray(projectStart, projectEnd);
}
function appendTimelineStructure(timeline) {
  let yearRow = "",
    quarterRow = "",
    monthRow = "",
    tenRow = "",
    guidelineRow = "";
  let currentYear = null,
    yearColspan = 0;
  let currentQuarter = null,
    quarterColspan = 0;
  let currentMonth = null,
    monthColspan = 0;
  let currentTen = null,
    tenColspan = 0;
  const structureInRow = `<div style="display: flex; flex-direction: column; justify-content:center ; height: 100%; width: 100%; position: relative"><div style="height: 50%; width: 100%; "></div></div>`;
  timeline.forEach((item) => {
    if (item.year !== currentYear) {
      if (yearColspan > 0)
        yearRow += `<td class="header years" colspan="${yearColspan}">${currentYear}</td>`;
      currentYear = item.year;
      yearColspan = item.day;
    } else {
      yearColspan += item.day;
    }
    if (item.quarter !== currentQuarter) {
      if (quarterColspan > 0)
        quarterRow += `<td class="header q${currentQuarter}" colspan="${quarterColspan}">Q${currentQuarter}</td>`;
      currentQuarter = item.quarter;
      quarterColspan = item.day;
    } else {
      quarterColspan += item.day;
    }
    if (item.month !== currentMonth) {
      currentMonth = item.month;
      monthColspan = item.day;
      if (monthColspan > 0)
        monthRow += `<td class="header q${currentQuarter}-month month-end" colspan="${monthColspan}">${mMonth[
          item.month
        ].toUpperCase()}</td>`;
    } else {
      monthColspan += item.day;
    }
    let daysInMonth = item.day;
    const middleMonth = (item.quarter - 1) * 3 + 2;
    for (let d = 1; d <= daysInMonth; d++) {
      let tenLabel = d <= 10 ? "1" : d <= 20 ? "10" : "20";
      if (d === 1 || d === 11 || d === 21) {
        if (tenColspan > 0)
          tenRow += `<td class="header days q${currentQuarter}-ten" colspan="${tenColspan}">${currentTen}</td>`;
        currentTen = tenLabel;
        tenColspan = 1;
      } else {
        tenColspan += 1;
      }
      let dateStr = `${item.year}-${String(item.month).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      let isFirstTen = d === 1;
      let isLastTen = d === daysInMonth || d === 10 || d === 20;
      let isMonthEndDay = d === daysInMonth;
      let borderClass = "";
      if (isFirstTen) borderClass += " ten-day-start";
      if (isLastTen) borderClass += " ten-day-end";
      let guidelineClass =
        item.month === middleMonth ? `q${currentQuarter}-guideline` : "";
      let monthEndClass = "";
      if (isMonthEndDay) monthEndClass += " month-end";
      guidelineRow += `<td class="${dateStr} ${guidelineClass}${borderClass}${monthEndClass}">${structureInRow}</td>`;
    }
    if (tenColspan > 0) {
      tenRow += `<td class="header days q${currentQuarter}-ten month-end" colspan="${tenColspan}">${currentTen}</td>`;
      tenColspan = 0;
    }
  });
  if (yearColspan > 0)
    yearRow += `<td class="header years" colspan="${yearColspan}">${currentYear}</td>`;
  if (quarterColspan > 0)
    quarterRow += `<td class="header q${currentQuarter}" colspan="${quarterColspan}">Q${currentQuarter}</td>`;
  $("#timeline .year").html(yearRow);
  $("#timeline .quarter").html(quarterRow);
  $("#timeline .month").html(monthRow);
  $("#timeline .guideline").append(guidelineRow);
  $("#timeline .day").before(`<tr class="ten">${tenRow}</tr>`);
}
function appendTimelineStages(timelineObject) {
  // Energetic color list for first-col
  const colorCount = 6;
  const typeMap =
    timelineObject.config && timelineObject.config.typeMap
      ? timelineObject.config.typeMap
      : config.typeMap;
  const majorBgColor =
    timelineObject.config && timelineObject.config.majorBgColor
      ? timelineObject.config.majorBgColor
      : config.majorBgColor;
  timelineObject.stages.forEach((stage, stageIdx) => {
    const itemCount = stage.items.length;
    stage.items.forEach((item, key) => {
      const $itemRow = $("#timeline .guideline").clone();
      $itemRow.removeClass("guideline").addClass("item-row");
      if (key === 0) {
        $itemRow.find(".first-col").addClass(`color-${stageIdx % colorCount}`)
          .html(`
                    <div style="font-weight:600; font-size:1.2rem; color:#1e293b; margin-bottom: 10px;">${
                      stage.stage
                    }</div>
                    <div style="font-size:1rem; color:#4b4f55; margin-top:2px;">${
                      stage.desc || ""
                    }</div>
                `);
        $itemRow.find(".first-col").attr("rowspan", itemCount);
      } else {
        $itemRow.find(".first-col").remove();
      }
      const startDate = new Date(item.start);
      const endDate = new Date(item.end);
      let currentDate = new Date(startDate);
      // Get color for this type
      let typeColor = majorBgColor;
      if (item.type && typeMap[item.type]) typeColor = typeMap[item.type];
      while (currentDate <= endDate) {
        const dateStr = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        $itemRow.find(`td.${dateStr} div div`).addClass("timeline-line");
        let isFinished = false;
        if (endDate < new Date()) {
          $itemRow.find(`td.${dateStr} div div`).addClass("finished");
          isFinished = true;
        } else {
          $itemRow.find(`td.${dateStr} div div`).addClass("working");
          // Set background color for this timeline item cell
          $itemRow.find(`td.${dateStr} div div`).css({
            background: typeColor,
            borderColor: typeColor,
          });
        }
        // Add critical-path-item class if item is critical
        if (item.critical) {
          $itemRow.find(`td.${dateStr} div div`).addClass("critical-path-item");
        }
        if (dateStr === item.start) {
          $itemRow.find(`td.${dateStr} div div`).addClass("start");
        }
        if (dateStr === item.end) {
          $itemRow.find(`td.${dateStr} div div`).addClass("end");
          $itemRow.find(`td.${dateStr} div div`).append(`
                        <div class="item-name ${
                          isFinished ? "item-finished" : ""
                        }">
                            <span>${item.name}</span>
                        </div>
                    `);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      $("#timeline").append($itemRow);
    });
  });
}
function showTimelineFromForm() {
  const projectStartRaw = document.getElementById("projectStart").value;
  const projectEndRaw = document.getElementById("projectEnd").value;
  const projectStart = formatDateInput(projectStartRaw);
  const projectEnd = formatDateInput(projectEndRaw);
  const timelineObject = {
    basic: { projectStart, projectEnd },
    stages: stages.map((s) => ({
      stage: s.stage,
      desc: s.desc,
      items: s.items.map((it) => ({
        name: it.name,
        start: formatDateInput(it.start),
        end: formatDateInput(it.end),
        type: it.type || "",
        critical: !!it.critical,
      })),
    })),
  };
  $(".loading-text").text("Loading timeline...");
  $(".loading-indicator").addClass("active");
  setTimeout(() => {
    $("#timeline").remove();
    $("#timeline-container").html(
      `<table id='timeline'><tr class='guideline'><td width="200" rowspan='5' class='first-col'></td></tr><tr class='year'></tr><tr class='quarter'></tr><tr class='month'></tr><tr class='day'></tr></table>`
    );
    $("#fullscreenTimelineBtn, .export-button").css("display", "flex");
    const timeline = getTimelineStructure(projectStart, projectEnd);
    appendTimelineStructure(timeline);
    appendTimelineStages(timelineObject);
    $(".loading-indicator").removeClass("active");
  }, 100);
}
document.getElementById("showTimelineBtn").onclick = showTimelineFromForm;
// PNG Export
function exportTimelineAsPNG() {
  const timeline = document.getElementById("timeline");
  $(".loading-indicator").addClass("active");
  $(".loading-text").text("Exporting image...");
  html2canvas(timeline, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
    useCORS: true,
  }).then((canvas) => {
    $(".loading-indicator").removeClass("active");
    const link = document.createElement("a");
    link.download = "timeline-export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

$(".export-button").on("click", exportTimelineAsPNG);

// --- Fullscreen Timeline Popup ---
const fullscreenBtn = document.getElementById("fullscreenTimelineBtn");
const fullscreenPopup = document.getElementById("fullscreenTimelinePopup");
const fullscreenContent = document.getElementById("fullscreenTimelineContent");
const fullscreenInner = document.getElementById("fullscreenTimelineInner");
const closeFullscreenBtn = document.getElementById(
  "closeFullscreenTimelineBtn"
);

fullscreenBtn.addEventListener("click", function () {
  // Clone the timeline table for fullscreen view
  const timelineTable = document.getElementById("timeline");
  if (timelineTable) {
    fullscreenInner.innerHTML = "";
    // Deep clone to avoid ID conflicts
    const clone = timelineTable.cloneNode(true);
    clone.id = "timeline-fullscreen";
    fullscreenInner.appendChild(clone);
    fullscreenPopup.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});
closeFullscreenBtn.addEventListener("click", function () {
  fullscreenPopup.style.display = "none";
  fullscreenInner.innerHTML = "";
  document.body.style.overflow = "";
});

// Config UI logic

const configPanel = document.getElementById("configSlidePanel");
const configOverlay = document.getElementById("configOverlay");
const openConfigBtn = document.getElementById("openConfigBtn");
const closeConfigBtn = document.getElementById("closeConfigBtn");

let configPanelOriginal = null;
let configPanelOriginalConfig = null;
function getConfigPanelSnapshot() {
  // Return a snapshot of config relevant fields
  return {
    majorBgColor: document.getElementById("majorBgColor").value,
    typeList: Array.from(
      document.querySelectorAll("#typeList .type-name-input")
    ).map((input) => input.value.trim()),
    colorList: Array.from(
      document.querySelectorAll("#typeList .type-color-input")
    ).map((input) => input.value),
  };
}
function isConfigPanelChanged() {
  if (!configPanelOriginal) return false;
  const snap = getConfigPanelSnapshot();
  if (snap.majorBgColor !== configPanelOriginal.majorBgColor) return true;
  if (snap.typeList.length !== configPanelOriginal.typeList.length) return true;
  for (let i = 0; i < snap.typeList.length; i++) {
    if (snap.typeList[i] !== configPanelOriginal.typeList[i]) return true;
    if (snap.colorList[i] !== configPanelOriginal.colorList[i]) return true;
  }
  return false;
}
function restoreConfigPanelToOriginal() {
  if (!configPanelOriginalConfig) return;
  config.majorBgColor = configPanelOriginalConfig.majorBgColor;
  config.typeMap = JSON.parse(
    JSON.stringify(configPanelOriginalConfig.typeMap)
  );
  renderTypeList();
  renderStages();
  document.getElementById("majorBgColor").value = config.majorBgColor;
}

openConfigBtn.onclick = function () {
  configPanel.classList.add("active");
  configOverlay.style.display = "block";
  renderTypeList();
  // Take snapshot after render
  setTimeout(() => {
    configPanelOriginal = getConfigPanelSnapshot();
    // Deep copy config for restore
    configPanelOriginalConfig = {
      majorBgColor: config.majorBgColor,
      typeMap: JSON.parse(JSON.stringify(config.typeMap)),
    };
  }, 0);
};

function tryCloseConfigPanel() {
  if (isConfigPanelChanged()) {
    if (!confirm("You have unsaved changes in config. Discard all changes?"))
      return;
    // Restore config to original
    restoreConfigPanelToOriginal();
  }
  configPanel.classList.remove("active");
  configOverlay.style.display = "none";
}

closeConfigBtn.onclick = tryCloseConfigPanel;
configOverlay.onclick = function (e) {
  // Only close if click is directly on overlay, not on panel
  if (e.target === configOverlay) {
    tryCloseConfigPanel();
  }
};
// Prevent click inside panel from closing
configPanel.addEventListener("mousedown", function (e) {
  e.stopPropagation();
});

function renderTypeList() {
  const typeListDiv = document.getElementById("typeList");
  typeListDiv.innerHTML = "";
  const typeMap = config.typeMap || {};
  const types = Object.keys(typeMap);
  if (types.length === 0) {
    typeListDiv.innerHTML =
      '<div style="color:#64748b; font-size:13px;">No types defined. Add a type below.</div>';
    return;
  }
  types.forEach((type, idx) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";
    row.style.marginBottom = "6px";
    row.innerHTML = `
      <input type="text" value="${type}" data-idx="${idx}" class="type-name-input" style="width:100px; font-size:13px; padding:2px 6px; border-radius:4px; border:1px solid #cbd5e1;" />
      <input type="color" value="${typeMap[type]}" data-idx="${idx}" class="type-color-input" style="width:36px; height:28px; border:none; background:none;" />
      <button type="button" class="btn btn-remove type-remove-btn" data-idx="${idx}" title="Remove Type">Remove</button>
    `;
    typeListDiv.appendChild(row);
  });
  // Add event listeners for type name changes (only validate, do not apply changes)
  typeListDiv.querySelectorAll(".type-name-input").forEach((input) => {
    input.addEventListener("change", function () {
      const idx = parseInt(this.getAttribute("data-idx"));
      const oldType = Object.keys(config.typeMap)[idx];
      const newType = this.value.trim();
      if (!newType) {
        this.value = oldType;
        return;
      }
      // Check for duplicate
      let duplicate = false;
      typeListDiv
        .querySelectorAll(".type-name-input")
        .forEach((otherInput, i) => {
          if (i !== idx && otherInput.value.trim() === newType)
            duplicate = true;
        });
      if (duplicate) {
        document.getElementById("typeConfigError").textContent =
          "Type name already exists.";
        document.getElementById("typeConfigError").style.display = "block";
        this.value = oldType;
        return;
      }
      document.getElementById("typeConfigError").style.display = "none";
    });
  });
  // Add event listeners for color changes (do not update timeline items)
  typeListDiv.querySelectorAll(".type-color-input").forEach((input) => {
    input.addEventListener("input", function () {
      const idx = parseInt(this.getAttribute("data-idx"));
      const type = Object.keys(config.typeMap)[idx];
      config.typeMap[type] = this.value;
      renderStages();
    });
  });
  // Remove type and update timeline items with this type to first available type
  typeListDiv.querySelectorAll(".type-remove-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.getAttribute("data-idx"));
      const type = Object.keys(config.typeMap)[idx];
      delete config.typeMap[type];
      const firstType = Object.keys(config.typeMap)[0] || "";
      for (const s of stages) {
        for (const it of s.items) {
          if (it.type === type) it.type = firstType;
        }
      }
      renderTypeList();
      renderStages();
    });
  });
}

document.getElementById("addTypeBtn").onclick = function () {
  // Add a new type with default name and color
  let base = "Type";
  let idx = 1;
  let newType = base + idx;
  while (config.typeMap[newType]) {
    idx++;
    newType = base + idx;
  }
  config.typeMap[newType] = "#60a5fa";
  renderTypeList();
  renderStages();
};

document.getElementById("saveConfigBtn").onclick = function () {
  config.majorBgColor = document.getElementById("majorBgColor").value;
  // Gather type names and colors from UI
  const typeInputs = document.querySelectorAll("#typeList .type-name-input");
  const colorInputs = document.querySelectorAll("#typeList .type-color-input");
  const newTypeMap = {};
  let typeNames = [];
  let hasError = false;
  for (let i = 0; i < typeInputs.length; i++) {
    const typeName = typeInputs[i].value.trim();
    if (!typeName) {
      document.getElementById("typeConfigError").textContent =
        "Type name cannot be empty.";
      document.getElementById("typeConfigError").style.display = "block";
      hasError = true;
      break;
    }
    if (typeNames.includes(typeName)) {
      document.getElementById("typeConfigError").textContent =
        "Type name already exists.";
      document.getElementById("typeConfigError").style.display = "block";
      hasError = true;
      break;
    }
    typeNames.push(typeName);
    newTypeMap[typeName] = colorInputs[i].value;
  }
  if (hasError) return;
  document.getElementById("typeConfigError").style.display = "none";
  // Rename types in timeline items if needed
  const oldTypeMap = config.typeMap;
  // Build mapping from old type to new type (by index)
  const oldTypes = Object.keys(oldTypeMap);
  for (let i = 0; i < oldTypes.length; i++) {
    const oldType = oldTypes[i];
    const newType = typeInputs[i] ? typeInputs[i].value.trim() : null;
    if (newType && oldType !== newType) {
      for (const s of stages) {
        for (const it of s.items) {
          if (it.type === oldType) it.type = newType;
        }
      }
    }
  }
  config.typeMap = newTypeMap;
  renderStages();
  renderTypeList();
  // Close the config slider
  configPanelOriginal = null;
  configPanelOriginalConfig = null;
  document.getElementById("configSlidePanel").classList.remove("active");
  document.getElementById("configOverlay").style.display = "none";
};

// Initial render
renderStages();
renderTypeList();
