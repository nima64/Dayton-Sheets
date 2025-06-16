'use client';

import Spreadsheet from "react-spreadsheet";


export default function SpreadSheet (){
  const columnLabels = [
  "Make",
  "Model",
  "Specific Configuration",
  "Price Quote",
  "At Least 9/10 Without Retail Box",
  "Qty"
];

  const rowLabels = [];
  const data = [
    [{ value: "Bixolon" }, { value: "Srp-F310II" }, {value:"SRP-F310IICOSK"}],
    [{ value: "Brady" }, { value: "BMP51" }, {value:"139814"}],
  ];
  return (
    <div className="flex mt-13 justify-center min-h-screen">
    <Spreadsheet
      data={data}
      columnLabels={columnLabels}
    /></div>
  );
};

