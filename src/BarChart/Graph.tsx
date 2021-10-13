import React, { useState } from 'react';
import { DataType, HoverDataType, HoverRowDataType, OptionsDataType } from '../Types';
import { scaleBand, scaleLinear } from 'd3-scale';
import { getRange } from '../Utils/getRange';
import { getColor } from '../Utils/getColor';
import { HoverTooltip } from '../Components/HoverTooltip';
import styled from 'styled-components';
import domtoimage from 'dom-to-image';
import { ColorScale } from '../Components/ColorScale';

interface Props {
  data: DataType[];
  firstMetric: OptionsDataType;
  colorMetric: OptionsDataType;
}

const TopSettings = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`;

const Button = styled.button`
	padding: 2rem;
	border-radius: 0.2rem;
	font-size: 1.4rem;
  font-weight: 700;
	background-color: var(--bg-blue);
  color: var(--navy);
  border: 0;
  text-transform: uppercase;
  margin: 0 1rem;
  cursor: pointer;
  border-radius: 100px;
  padding: 1rem 3rem;
  &:hover {
    background: #B6D3FE;
  }
  &:active{
    background: #84B5FD;
  }
`;

export const Graph = (props: Props) => {
  const {
    data,
    firstMetric,
    colorMetric,
  } = props;

  const [hoverInfo, setHoverInfo] = useState<HoverDataType | null>(null);


  const width = 1280;
  const height = 720;
  const margin = {
    top: 20,
    bottom: 20,
    left: 30,
    right:10,
  };

  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;
  const heightDomain = getRange(data,firstMetric.Indicator);
  const heightScale = scaleLinear().domain(heightDomain).range([graphHeight,0]).nice();
  const xScale = scaleBand()
    .domain(data.map(d =>d['Country or Area']))
    .range([0, graphWidth])
    .paddingInner(0.25);
  const yTicks = heightScale.ticks(5);
  const colorDomain = !colorMetric.Categorical ?  getRange(data,colorMetric.Indicator,true) : null;
  return (<>
    <TopSettings>
      {
        colorMetric.Indicator !== 'Not Selected' ?
          <ColorScale 
            colorMetric = {colorMetric} 
            colorDomain = {!colorMetric.Categorical ? getRange(data,colorMetric.Indicator, true) : [0,0]} 
          /> : <div style={{height:'7.2rem'}}/>
      }
      <div>
        <Button 
          onClick={() => {
          // tslint:disable-next-line: no-floating-promises
            domtoimage
              .toPng(document.getElementById('graph-node') as HTMLElement)
              .then((dataUrl: any) => {
                const link = document.createElement('a');
                link.download = 'graph.png';
                link.href = dataUrl;
                link.click();
              });
          }}>Download Image</Button>
      </div>
    </TopSettings>
    <div id="graph-node">
      <svg width={'100%'} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <g className='ticks'>
            {yTicks.map((d,i) => 
              <>
                <line
                  key={i}
                  x1={-1 * margin.left}
                  y1={heightScale(d)}
                  x2={width}
                  y2={heightScale(d)}
                  stroke={'#CCCCCC'}
                  strokeWidth={1}
                  strokeDasharray='4 8'
                />
                <text
                  key={i}
                  x={-1 * margin.left}
                  y={heightScale(d)}
                  fontSize='12px'
                  textAnchor='start'
                  dy={'-5px'}
                  fill='#919399'
                >
                  {d}
                </text>
              </>
            )}
          </g>
          {
            data.map((d,i) => {
              const rowData: HoverRowDataType[] = [
                {
                  title: firstMetric.Indicator,
                  value: d.Indicators[d.Indicators.findIndex(el => el.Indicator === firstMetric.Indicator)].Value,
                },
              ];
              if(colorMetric.Indicator !== 'Not Selected' && colorMetric.Indicator !== 'Continents') {
                rowData.push({
                  title: colorMetric.Indicator,
                  value: d.Indicators.findIndex(el => el.Indicator === colorMetric.Indicator) >= 0 ? d.Indicators[d.Indicators.findIndex(el => el.Indicator === colorMetric.Indicator)].Value : 'NA',
                });
              }
              return <rect
                key={i}
                x={xScale(d['Country or Area'])}
                y={heightScale(Math.max(0, d.Indicators[d.Indicators.findIndex(el => el.Indicator === firstMetric.Indicator)].Value))}
                width={xScale.bandwidth()}
                fill={getColor(d, colorMetric, colorDomain)}
                height={Math.abs(heightScale(d.Indicators[d.Indicators.findIndex(el => el.Indicator === firstMetric.Indicator)].Value) - heightScale(0))}
                onMouseEnter={(event) => {
                  setHoverInfo({
                    country: d['Country or Area'],
                    continent:d['Group 1'],
                    rows: rowData,
                    xPosition: event.clientX,
                    yPosition: event.clientY,
                  });
                }}
                onMouseMove={(event) => {
                  setHoverInfo({
                    country: d['Country or Area'],
                    continent:d['Group 1'],
                    rows: rowData,
                    xPosition: event.clientX,
                    yPosition: event.clientY,
                  });
                }}
                onMouseLeave={() => {
                  setHoverInfo(null);
                }}
              />;
            })
          }
          {
            xScale.bandwidth() >= 15 ? 
              data.map((d,i) => 
                <text
                  key={i}
                  x={xScale(d['Country or Area']) as number + (xScale.bandwidth() / 2)}
                  y={heightScale(0)}
                  fontSize='12px'
                  textAnchor='middle'
                  fill='#110848'
                  dy={d.Indicators[d.Indicators.findIndex(el => el.Indicator === firstMetric.Indicator)].Value > 0 ? '15px' : '-5px'}
                >
                  {d['Alpha-2 code']}
                </text>
              )
              : null
          }
          <line 
            x1={-1 * margin.left}
            y1={heightScale(0)}
            x2={width}
            y2={heightScale(0)}
            stroke='#110848'
            strokeWidth={1}
          />
        </g>
      </svg> 
    </div>
    {
      hoverInfo ? 
        <HoverTooltip data={hoverInfo}/>
        : null
    }
  </>
  );
};