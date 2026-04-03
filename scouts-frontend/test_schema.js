const fs = require('fs');
fetch("https://hfkhmocxhdobemhyznvw.supabase.co/graphql/v1", {
  method: 'POST',
  headers: {
    'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhma2htb2N4aGRvYmVtaHl6bnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODIxNTMsImV4cCI6MjA4NTE1ODE1M30.hBd7NV3gVgSvEbwiMlY7W1iAStmV_aXBQ5wuHhs4Ips",
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: "{ __schema { types { name fields { name } } } }" })
}).then(r => r.json()).then(data => {
  const t = data.data.__schema.types.find(t => t.name.includes("Collection") && t.name !== "StringFilterCollection");
  console.log(t ? t.name + " fields: " + t.fields.map(f=>f.name).join(", ") : "no coll type");
  fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
});
