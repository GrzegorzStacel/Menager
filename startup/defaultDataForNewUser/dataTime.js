module.exports = function getDateAndTime() {
    const actualDate = new Date().toISOString()
    return actualDate.slice(0, 10) + ' ' + actualDate.slice(11, 16)
}
