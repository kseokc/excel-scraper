function createCurriculumData(results) {
  const CurriculumList = [];

  results.forEach((entry, index) => {

    const YearCurriculumListExcel = {
      year: "",
      교양필수: [],
      전공필수: [],
      전공선택: [],
      핵심교양: [],
    };

    YearCurriculumListExcel.year = entry.year;

    entry.course.교육과정.forEach(item => {
      let courseData = {
        과목명: item.교과목명,
        학수번호: item.학수번호,
        학점: item.학점,
      };
      if (item.영역 === "교양필수" && item.교과목명.includes("핵심교양-")) {
        YearCurriculumListExcel.핵심교양.push(courseData);
      } else {
        YearCurriculumListExcel[item.영역].push(courseData);
      }
    });
    CurriculumList.push(YearCurriculumListExcel);
  });

  return CurriculumList;
}

function changeExcel(datas) {
  let header = "<tr>";

  let RowList = {
    교양필수: [],
    전공필수: [],
    전공선택: [],
  };

  let 교필최대 = 0;
  let 전선최대 = 0;
  let 전필최대 = 0;
  datas.forEach(item => {
    교필최대 = Math.max(교필최대, item.교양필수.length);
    전선최대 = Math.max(전선최대, item.전공선택.length);
    전필최대 = Math.max(전필최대, item.전공필수.length);
  });

  datas.forEach((item, index) => {
    header += "<td colspan='4'>" + item.year + "</td>";

    item.교양필수.forEach((data, idx) => {
      let course =
        `<td>${data.과목명}</td>` +
        `<td>${data.학수번호}</td>` +
        `<td>${data.학점}</td>`;

      if (idx === 0) {
        course = `<td rowspan='${교필최대}'>교양필수</td>` + course;
      }

      if (!RowList.교양필수[idx]) {
        RowList.교양필수[idx] = "<tr>";
      }
      RowList.교양필수[idx] += course;
    });

    item.전공선택.forEach((data, idx) => {
      let course =
        `<td>${data.과목명}</td>` +
        `<td>${data.학수번호}</td>` +
        `<td>${data.학점}</td>`;

      if (idx === 0) {
        course = `<td rowspan='${전선최대}'>전공선택</td>` + course;
      }

      if (!RowList.전공선택[idx]) {
        RowList.전공선택[idx] = "<tr>";
      }
      RowList.전공선택[idx] += course;
    });

    item.전공필수.forEach((data, idx) => {
      let course =
        `<td>${data.과목명}</td>` +
        `<td>${data.학수번호}</td>` +
        `<td>${data.학점}</td>`;

      if (idx === 0) {
        course = `<td rowspan='${전필최대}'>전공필수</td>` + course;
      }

      if (!RowList.전공필수[idx]) {
        RowList.전공필수[idx] = "<tr>";
      }
      RowList.전공필수[idx] += course;
    });

    // 부족한 개수만큼 빈 셀 추가
    let emptyCells = 교필최대 - item.교양필수.length;
    for (let i = 0; i < emptyCells; i++) {
      let emptyIdx = item.교양필수.length + i;
      if (!RowList.교양필수[emptyIdx]) {
        RowList.교양필수[emptyIdx] = "<tr>";
      }
      RowList.교양필수[emptyIdx] += "<td colspan='3'></td>";
    }

    let emptyCells1 = 전필최대 - item.전공필수.length;
    for (let i = 0; i < emptyCells1; i++) {
      let emptyIdx = item.전공필수.length + i;
      if (!RowList.전공필수[emptyIdx]) {
        RowList.전공필수[emptyIdx] = "<tr>";
      }
      RowList.전공필수[emptyIdx] += "<td colspan='3'></td>";
    }

    let emptyCells2 = 전선최대 - item.전공선택.length;
    for (let i = 0; i < emptyCells2; i++) {
      let emptyIdx = item.전공선택.length + i;
      if (!RowList.전공선택[emptyIdx]) {
        RowList.전공선택[emptyIdx] = "<tr>";
      }
      RowList.전공선택[emptyIdx] += "<td colspan='3'></td>";
    }
  });

  // 모든 <tr> 닫기
  RowList.교양필수 = RowList.교양필수.map(row => row + "</tr>");
  RowList.전공필수 = RowList.전공필수.map(row => row + "</tr>");
  RowList.전공선택 = RowList.전공선택.map(row => row + "</tr>");

  header += "</tr>";
  body="";

  Object.keys(RowList).forEach(item=>{
    RowList[item].forEach((item)=>{
        body+=item;
    })
  })
  
  resultTableCode=`<table><thead>${header}</thead> <tbody>${body}</tbody></table>`;
  
  return resultTableCode;
}

module.exports = {
  createCurriculumData: createCurriculumData,
  changeExcel: changeExcel,
};
