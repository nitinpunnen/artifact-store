import React, {useState} from "react";
import "./GraphSearch.css";
import "@aws-amplify/ui-react/styles.css";
import {
    Flex,
    Heading, SearchField, Table, TableBody, TableCell, TableRow, Text

} from '@aws-amplify/ui-react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {API} from "aws-amplify";
import person from "../../assets/person.png";
import organization from "../../assets/organization.png";
import location from "../../assets/location.png";
import drawing from "../../assets/drawing.png";
import part from "../../assets/part.png";
import document from "../../assets/document.png";
// Load Highcharts modules
require('highcharts/modules/networkgraph')(Highcharts);

const GraphSearch = () => {
    const [resultItems, setResultItems] = useState([{}]);
    const [selectedNode, setSelectedNode] = useState('');
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: "networkgraph",
            marginTop: 20
        },
        title: {
            text: ""
        },
        plotOptions: {
            networkgraph: {
                layoutAlgorithm: {
                    enableSimulation: true,
                    gravitationalConstant: 0.2,
                    linkLength: 60,
                    friction: -0.9
                },
                point: {
                    events: {
                        click: (e) => {
                            updateGraph(e.point.id);
                            setSelectedNode(e.point.id);
                        }
                    },
                }
            }
        },
        series: [
            {
                marker: {
                    radius: 10
                },
                dataLabels: {
                    enabled: true,
                    linkFormat: '{point.label}',
                    allowOverlap: false,
                    y: -10
                },
                data: [
                ],
                nodes: [{
                }]
            }
        ]
    });

    async function updateGraph(value) {
        const response = await API.get('searchNeptune', '/search', {
            headers: {},
            response: true,
            queryStringParameters: {
                query: value
            }
        });
        const resultItems = response.data;
        setResultItems(resultItems);
        console.log('resultItems is ', resultItems);

        let networkData = [];
        let networkNode = [];

        for (let i = 0; i < resultItems.length; i++) {
            //Ignore the first Result Item to create the data. But need it for nodes
            if (i !== 0) {
                const dataNode = {
                    'from': resultItems[0].name[0],
                    'to': resultItems[i].name[0],
                    'label': resultItems[i].relationship};
                networkData.push(dataNode);
            }
            let symbolUrl = null;

            if (resultItems[i].label === 'organization')
                symbolUrl = organization;
            else if (resultItems[i].label === 'location')
                symbolUrl = location;
            else if (resultItems[i].label === 'person')
                symbolUrl = person;
            else if (resultItems[i].label === 'part')
                symbolUrl = part;
            else if (resultItems[i].label === 'drawing')
                symbolUrl = drawing;
            else if (resultItems[i].label === 'document')
                symbolUrl = document;

            const nodeNode = {
                id: resultItems[i].name[0], marker: {
                    symbol: 'url(' + symbolUrl + ')',
                }
            };
            networkNode.push(nodeNode);
        }
        console.log('networkNode is ', networkNode);
        chartOptions.series[0].data = networkData;
        chartOptions.series[0].nodes = networkNode;
        console.log('options is ', chartOptions);
    }

    return (
        <Flex
            direction={{base: 'column', large: 'column'}}
            padding="1rem"
            width="100%"
        >
            <Heading level={4} style={{textAlign: "left"}}>Entity Search</Heading>
            <Flex direction={{base: 'row', large: 'row'}}
                  padding="1rem"
                  width="50%"
                  style={{alignItems: "center", margin: "auto", display: "block"}}
            >
                <SearchField
                    label="Search"
                    placeholder="Search for Entities..."
                    size={"large"}
                    onChange={(event) => {
                        setSelectedNode(event.target.value);
                    }}
                    value={selectedNode}
                    onSubmit={(value) => updateGraph(value)}
                />
            </Flex>
            <Flex direction={{base: 'row', large: 'row'}}
                  padding="1rem"
                  width="100%"
                  style={{alignItems: "center"}}
            >
                {(chartOptions.series[0].data.length > 0) && <HighchartsReact highcharts={Highcharts} options={chartOptions} containerProps={{
                    style: {
                        height: "600px",
                        display: "block",
                        width: "70%",
                        margin: "0 auto",
                    }
                }}/>}
                <Flex
                    direction={{base: 'column', large: 'column'}}
                    padding="1rem"
                    width="30%"
                    height="600px"
                >
                    <Table
                        className="my-custom-table"
                        caption=""
                        highlightOnHover="true">
                        <TableBody>
                            {Object.keys(resultItems[0]).map(key => {
                                return (
                                    <TableRow key={key}>
                                        <TableCell>
                                            {key}
                                        </TableCell>
                                        <TableCell>
                                            <strong>{resultItems[0][key]}</strong>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Flex>
            </Flex>
        </Flex>

    );
};

export default GraphSearch;