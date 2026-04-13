fetch('http://localhost:3000/api/shops').then(r => console.log(r.status)).catch(e => console.error(e.message));
