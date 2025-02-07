const axios = require("axios");
const cheerio = require("cheerio");


const curri_field = ["영역", "", "과목영역", "학수번호", "교과목명", "학점", "이수시기", "비고"];
const credit_field = ["총이수", "단일전공", "복수연계융합전공", "부전공"];


// 해당 과의 해당 학년에 들어갔을때의 데이터
const getHtml = async (url) => {
  try {
    const html = await axios.get(`https://sugang.inha.ac.kr/sugang/SU_51001/${url}`);
    const $ = cheerio.load(html.data);
    const testData = {
      "필수이수학점": {},
      "교육과정": []
    };
    const tableCredit = $(`table[summary="조회목록"]`); // 전공이수학점을 가져온다
    tableCredit.find('tbody').each((index, element) => {
      const data = {
        "총이수": 130,
        "단일전공": parseInt($(element).find('#lblJunCredit').text().trim(),10),
        "복수_연계_융합_전공": parseInt($(element).find('#lblPl1Credit').text().trim(),10),
        "부전공": parseInt($(element).find('#lblSub11Credit').text().trim(),10)
      }
      testData.필수이수학점=data;
    });

    const table1 = $('#gvCurriculum'); // 교과과정테이블 가져옴
   
    table1.find('tr').each((index, element) => {
      const data = {};
      $(element).find('.Left').each((i, td) => {
        data[`${curri_field[i]}`] = $(td).text().trim();
      });
      if (Object.keys(data).length > 0) {
        testData.교육과정.push(data);
      }
    });

    
    return testData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 결과를 저장할 배열
const results = [];

// 학과,년도 별로의 교과과정 url 가져오기
const getDataToYear = async (deptName) => {
  try {
    const response = await axios.post('https://sugang.inha.ac.kr/sugang/SU_51001/curriculum_all.aspx');
    var $ = cheerio.load(response.data);

    // 숨겨진 필드 값 추출
    const viewState = $('#__VIEWSTATE').val();
    const eventValidation = $('#__EVENTVALIDATION').val();
    const viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();

    // 2018~2024까지의 값을 가져오기
    const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

    for (let year of years) {
      const formData = new URLSearchParams();
      formData.append('__EVENTTARGET', 'ddlYear');
      formData.append('__EVENTARGUMENT', '');
      formData.append('__VIEWSTATE', viewState);
      formData.append('__EVENTVALIDATION', eventValidation);
      formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
      formData.append('ddlYear', year.toString());

      const postResponse = await axios.post('https://sugang.inha.ac.kr/sugang/SU_51001/curriculum_all.aspx', formData);
      var $ = cheerio.load(postResponse.data);
      const table1 = $('#gvList');

      // 각 연도별로 데이터를 수집하고 결과를 results 배열에 추가합니다.
      const yearResults = [];
      const promises = [];

      table1.find('tbody tr').each((index, element) => {
        const $row = $(element);
        const findValue = `td:contains(${deptName})`
        const $departmentTd = $row.find(findValue);

        if ($departmentTd.length > 0) {
          const curriculumUrl = $row.find('a').first().attr('href');
          const promise = getHtml(curriculumUrl).then(result => {
            yearResults.push({ year: year, course: result });
          });
          promises.push(promise);
        }
      });

      // 모든 행에 대한 처리가 완료될 때까지 기다린 후 yearResults를 results에 추가합니다.
      await Promise.all(promises);
      results.push(...yearResults);
    }

    return results;

  } catch (err) {
    console.error(err);
    return [];
  }
};


module.exports = {
  getDataToYear: getDataToYear
}

