const path = require("path");
const XLSX = require("xlsx");
const { JSDOM } = require("jsdom");

const {
  changeExcel,
  createCurriculumData,
} = require("./scraper/utils.js");

const fs = require("fs");
const { getDataToYear } = require("./scraper/scrap.js");


//따로 node에서 값을 입력을 받고 처리를 할때 사용
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 입력을 비동기적으로 받을 수 있게 하는 함수
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}


async function makeExcel() {
  try {
    const deptName = await askQuestion("학과를 입력해주세요 : ");
    if (!deptName) {
      console.error("학과명을 입력해야 합니다!");
      rl.close();
      return;
    }

    const results = await getDataToYear(deptName); // 모든 연도별 작업이 완료된 결과를 받음

    
    const resultData = createCurriculumData(results);
    
    // HTML 테이블 생성
    const tableCode = changeExcel(resultData);

    // HTML 문자열을 DOM으로 변환 (JSDOM 사용)
    const dom = new JSDOM(tableCode);
    const document = dom.window.document;
    const tableElement = document.querySelector("table");

    if (!tableElement) {
      console.error("HTML 테이블이 생성되지 않았습니다.");
      rl.close();
      return;
    }

    // SheetJS를 이용하여 HTML 테이블을 엑셀 시트로 변환
    const worksheet = XLSX.utils.table_to_sheet(tableElement);

    // Workbook 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 저장 경로 설정
    const dataFolderPath = path.join(__dirname, "./excelData");
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath, { recursive: true });
    }

    const filePath = path.join(dataFolderPath, `${deptName}.xlsx`);

    // 파일 저장
    XLSX.writeFile(workbook, filePath);
    console.log(`${deptName}.xlsx 파일이 생성되었습니다.`);

  } catch (error) {
    console.error("파일 생성 중 오류가 발생하였습니다:", error);
  } finally {
    rl.close();
  }
}

makeExcel();
