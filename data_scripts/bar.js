async function loadData() {
    const data = await d3.csv("data_scripts/combined_with_departments.csv");

    // Define salary ranges
    const salaryRanges = {
        'Low': [0, 50000],
        'Medium': [50001, 100000],
        'High': [100001, Infinity]
    };

    // Process and aggregate data
    const processedData = d3.rollups(data, 
        v => v.length, 
        d => d.DEPARTMENT, 
        d => {
            for (const [key, [min, max]] of Object.entries(salaryRanges)) {
                if (+d.PAY_TOTAL_ACTUAL >= min && +d.PAY_TOTAL_ACTUAL <= max) {
                    return key;
                }
            }
            return 'Other';
        }
    ).map(([department, values]) => ({
        department,
        values: Object.fromEntries(values)
    }));

    // Convert the processed data for D3.js usage
    createChart(processedData, Object.keys(salaryRanges).concat('Other'));
}



function createChart(data, salaryCategories) {
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Append SVG object to the body of the page
    const svg = d3.select("#chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.department))
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.sum(salaryCategories, k => d.values[k] || 0))])
        .range([height, 0]);

    // Add the X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

    // Add the Y-axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Define a color scale
    const color = d3.scaleOrdinal()
      .domain(salaryCategories)
      .range(d3.schemeCategory10);

    // Add the bars
    svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(data)
      .join("g")
        .attr("transform", d => `translate(${x(d.department)}, 0)`)
      .selectAll("rect")
      .data(d => salaryCategories.map(key => ({key: key, value: d.values[key]})))
      .join("rect")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

    // Initialize toggle functionality (not fully implemented here)
    document.getElementById('toggle').addEventListener('click', function() {
        console.log('Toggle between stacked and grouped view');
        // You'll need to adjust positioning and height/width of bars here
    });
}

loadData();
