import { createDbWorker } from "sql.js-httpvfs"
import dayjs, { Dayjs } from 'dayjs'
const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL(
  "sql.js-httpvfs/dist/sql-wasm.wasm",
  import.meta.url,
);


const config = {
  from: "inline",
  config: {
    serverMode: "full",
    requestChunkSize: 4 * 1024,
    url: "/onthisday.db"
  }
};

let maxBytesToRead = 10 * 1024 * 1024;

const worker = await createDbWorker(
  [config],
  workerUrl.toString(),
  wasmUrl.toString(),
  maxBytesToRead
);

export async function getCountryData(country: string){
  let dates = [];
  for (let i = 1833; i <= 2023; i++) {
    dates.push('\'' + dayjs().format(i + '-MM-DD') + '\'');
  }
  const result = await worker.db.exec(`select * from stats where country = ? AND date IN (${dates.join(', ')})`, [country])
  return result;
}

export async function getDailyCountryData(country: string, date: Dayjs){
  return null;
  const result = await worker.db.exec(`select * from stats where country = ? AND date = ?`, [country, date.format('YYYY-MM-DD')])
  return result;
}
