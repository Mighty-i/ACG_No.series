import React, { Fragment, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'


function TestPage() {
  const [companies, setCompanies] = useState({})

  const fetchCompanyData = async () => {
    try {
      const response = await window.api.fetchCompany()

      if (response && Array.isArray(response)) {
        const companyData = response.reduce((acc, company) => {
          const shortName = company.company_header

          if (company.company_header === 'H' || company.company_header === 'C') {
            if (!acc[shortName]) {
              acc[shortName] = []
            }

            if (company.company_header === 'H') {
              acc[shortName].push({
                head: company.company_branch_name,
                branch: company.branchRef2
              })
            } else if (company.company_header === 'C') {
              acc[shortName].push({
                head: company.company_branch_name,
                branch: company.short_name
              })
            }
          }
          return acc
        }, {})

        if (companyData['H']) {
          companyData['H'].sort((a, b) => {
            return a.branch.localeCompare(b.branch);
          });
        }

        if (companyData['C']) {
          companyData['C'].sort((a, b) => {
            return a.branch.localeCompare(b.branch);
          });
        }

        setCompanies(companyData)
        console.log(companyData)
      } else {
        console.error('เกิดข้อผิดพลาดในข้อมูล')
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error)
    }
  }

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const [selectedCompany, setSelectedCompany] = useState('')
  const [inputText, setInputText] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [tableData, setTableData] = useState({})

  const generateTable = () => {
    if (!selectedCompany || !inputText || !startDate || !endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const branches = companies[selectedCompany]
    const start = moment(startDate).startOf('month')
    const end = moment(endDate).startOf('month')

    const generatedData = {}

    branches.forEach((branch) => {
      const branchData = []
      let current = start.clone()

      while (current.isBefore(end) || current.isSame(end)) {
        const monthYear = current.format('YYMM')
        const day = current.format('D/M/YYYY')
        const detail = `${branch.branch}-${inputText}${monthYear}-0001`
        branchData.push({ day, detail })

        current.add(1, 'month')
      }
      generatedData[branch.branch] = {
        head: branch.head || branch.branch,
        data: branchData
      }
    })

    setTableData(generatedData)
  }

  const copyBranchDetail = (branchCode, branchData) => {
    const columnData = branchData.map((row) => `${row.day}\t ${row.detail}`).join('\n')
    const displayName = selectedCompany === 'HMW' ? tableData[branchCode].head : branchCode

    navigator.clipboard
      .writeText('')
      .then(() => {
        navigator.clipboard
          .writeText(columnData)
          .then(() => alert(`Copied data from "${displayName}" table!`))
          .catch((err) => console.error('Failed to copy:', err))
      })
      .catch((err) => console.error('Failed to clear clipboard:', err))
  }
  return (
    <Fragment>
      <div className="h-screen overflow-y-auto flex justify-center items-start">
        <div className="p-8">
          <h1 className="text-5xl font-bold">No. series</h1>

          <div className="grid grid-cols-5 gap-4 my-4 items-center w-[1400px] ">
            <div>
              <label className="block text-lg font-medium mb-2">Select Company: </label>
              <select
                onChange={(e) => setSelectedCompany(e.target.value)}
                value={selectedCompany}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800"
              >
                <option value="">Select Company</option>
                {Object.keys(companies).map((company) => {
                  let companyName = ''
                  if (company === 'H') {
                    companyName = 'บริษัท ฮอนด้ามะลิวัลย์ จำกัด'
                  } else if (company === 'C') {
                    companyName = 'บริษัท ออโตคลิกบายเอซีจี จำกัด'
                  }

                  return (
                    <option key={company} value={company}>
                      {companyName}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Enter Text: </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toUpperCase())}
                placeholder="Enter text (e.g., SQC)"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Select Start Date: </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Select End Date: </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800"
              />
            </div>

            <button className="bg-slate-700 rounded-3xl p-5" onClick={generateTable}>
              Generate Tables
            </button>
          </div>

          <div className="w-[1800px]">
            {Object.keys(tableData).length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-4">
                  {Object.entries(tableData).map(([branchCode, { head, data }]) => (
                    <section
                      key={branchCode}
                      className="border border-gray-300 rounded-lg p-4 min-w-[300px] flex-shrink-0"
                    >
                      <h2 className="text-center text-xl">สาขา: {head}</h2>

                      <div className="flex justify-center my-2">
                        <button
                          onClick={() => copyBranchDetail(branchCode, data)}
                          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Copy
                        </button>
                      </div>

                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border">Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 border text-center">{row.day}</td>
                              <td className="px-4 py-2 border text-center">{row.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default TestPage
