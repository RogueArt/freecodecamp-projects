const DATA_LINK = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json`

async function main() {
  const GDPData = await fetch(DATA_LINK).then(res => res.json()).catch(console.error)
  d3.select('div')
    .selectAll('p')
    .data(GDPData.data)
    .enter() // Bind the data to rect tags
    .append('p')
    .text(data => data)
}

main()
// console.log(x)
// console.log(d3)