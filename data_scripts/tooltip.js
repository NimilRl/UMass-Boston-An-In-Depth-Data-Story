d3.csv("data_scripts/combined_with_departments.csv").then(function(data) {
    const processedData = data.map(d => ({
        rating: +d.RATING,
        numRatings: +d.NUM_RATINGS,
        fullName: d.FULL_NAME
    }));
    initializeChart(processedData);
});

function initializeChart(data, radius = 20) {
    const svg = d3.select("svg.nimil").html(''),
          width = +svg.style('width').replace('px', ''),
          height = +svg.style('height').replace('px', '');

    const margin = {top: 20, right: 30, bottom: 30, left: 40},
          x = d3.scaleLinear()
              .domain([0, 5]) // Assume ratings are from 0 to 5
              .range([margin.left, width - margin.right]),
          y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.numRatings)])
              .range([height - margin.bottom, margin.top]);

    const hexbin = d3.hexbin()
        .x(d => x(d.rating))
        .y(d => y(d.numRatings))
        .radius(radius)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const bins = hexbin(data);
    const maxBinCount = d3.max(bins, d => d.length);
    const minBinCount = d3.min(bins, d => d.length) || 1; // avoid 0 in log scale
    const colorScaleDomain = [minBinCount, maxBinCount].map(d => Math.log(d));

    const color = d3.scaleSequential(d3.interpolateBuPu)
        .domain(colorScaleDomain)
        .interpolator(d3.interpolateInferno); // Using a different color scheme

    svg.selectAll("path")
        .data(bins)
        .join("path")
        .attr("d", hexbin.hexagon())
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill", d => color(d.length))
        .on("mouseover", (event, d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .html(`Names: ${d.map(bin => bin.fullName).join(', ')}`)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
        })
        .on("mouseout", () => {
            d3.select('#tooltip').style('display', 'none');
        });

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5))
        .attr("class", "axis");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .attr("class", "axis");
}

document.getElementById('radiusSlider').addEventListener('input', function() {
    const currentRadius = +this.value;
    d3.csv("data_scripts/combined_with_departments.csv").then(function(data) {
        const processedData = data.map(d => ({
            rating: +d.RATING,
            numRatings: +d.NUM_RATINGS,
            fullName: d.FULL_NAME
        }));
        initializeChart(processedData, currentRadius);
    });
});