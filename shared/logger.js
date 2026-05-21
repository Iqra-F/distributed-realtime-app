function log(event, data = {}) {
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    event,
    ...data,
  }));
}

module.exports = { log };