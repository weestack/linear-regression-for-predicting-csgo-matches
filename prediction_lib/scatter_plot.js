console.log("Hello world");

const scatter_plot = () => {
    const svg = d3.select(DOM.svg(width, width))
        .attr("viewBox", `${-padding} 0 ${width} ${width}`)
        .style("max-width", "100%")
        .style("height", "auto");
  
    svg.append("g")
        .call(xAxis);
  
    svg.append("g")
        .call(yAxis);
  
    const cell = svg.append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
      .join("g")
        .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);
  
    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("x", padding / 2 + 0.5)
        .attr("y", padding / 2 + 0.5)
        .attr("width", size - padding)
        .attr("height", size - padding);
  
    cell.each(function([i, j]) {
      d3.select(this).selectAll("circle")
        .data(data)
        .join("circle")
          .attr("cx", d => x[i](d[columns[i]]))
          .attr("cy", d => y[j](d[columns[j]]));
    });
  
    const circle = cell.selectAll("circle")
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => z(d.species));
  
    svg.append("g")
        .style("font", "bold 10px sans-serif")
      .selectAll("text")
      .data(columns)
      .join("text")
        .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(d => d);
  
    return svg.node();
  }