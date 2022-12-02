import React, {useState} from "react";
import "./GraphSearch.css";
import "@aws-amplify/ui-react/styles.css";
import {CheckboxField, Flex, Heading, SearchField, Table, TableBody, TableCell, TableRow} from '@aws-amplify/ui-react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {API} from "aws-amplify";
import person from "../../assets/person.png";
import organization from "../../assets/organization.png";
import location from "../../assets/location.png";
import drawing from "../../assets/drawing.png";
import part from "../../assets/part.png";
import document from "../../assets/document.png";
import supplier from "../../assets/supplier.png";
// Load Highcharts modules
require('highcharts/modules/networkgraph')(Highcharts);

const GraphSearch = () => {
    const [resultItems, setResultItems] = useState([]);
    const [selectedNode, setSelectedNode] = useState('');
    const [relationNames, setRelationNames] = useState([{}]);
    const [checked, setChecked] = useState([{}]);
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
                    gravitationalConstant: 0.8,
                    linkLength: 60,
                    friction: -0.9
                },
                point: {
                    events: {
                        click: (e) => {
                            CallSearch(e.point.id);
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
                data: [],
                nodes: [{}]
            }
        ]
    });

    async function CallSearch(value) {
        const response = await API.get('neptuneSearch', '/search', {
            headers: {},
            response: true,
            queryStringParameters: {
                entity: value
            }
        });
        const responseData = response.data;
        console.log('response data', responseData)
        await UpdateGraph(responseData);
        setResultItems(responseData);

        let uniqueRelations = new Set();
        responseData.map(item => {
            if (item.relationship) {
                uniqueRelations.add(item.relationship);
            }
        });
        setRelationNames(Array.from(uniqueRelations));
        setChecked(Array.from(uniqueRelations));
    }

    async function UpdateGraph(responseData) {
        let networkData = [];
        let networkNode = [];

        for (let i = 0; i < responseData.length; i++) {
            //Ignore the first Result Item to create the data. But need it for nodes
            if (i !== 0) {
                const dataNode = {
                    'from': responseData[0].name[0],
                    'to': responseData[i].name[0],
                    'label': responseData[i].relationship
                };
                networkData.push(dataNode);
            }
            let symbolUrl = null;

            if (responseData[i].label === 'customer')
                symbolUrl = organization;
            else if (responseData[i].label === 'location')
                symbolUrl = location;
            else if (responseData[i].label === 'person')
                symbolUrl = person;
            else if (responseData[i].label === 'part')
                symbolUrl = part;
            else if (responseData[i].label === 'supplier')
                symbolUrl = supplier;
            else if (responseData[i].label === 'drawing')
                symbolUrl = drawing;
            else if (responseData[i].label === 'document')
                symbolUrl = document;

            const nodeNode = {
                id: responseData[i].name[0], marker: {
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

    async function handleChecked(event) {
        let updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.name];
        } else {
            updatedList.splice(checked.indexOf(event.target.name), 1);
        }
        setChecked(updatedList);
        // First item (self) doesnt have relationship
        const filteredResultItems = resultItems.filter(item => !item.hasOwnProperty('relationship') || updatedList.includes(item.relationship));
        await UpdateGraph(filteredResultItems);
    }

    return (
        <Flex
            direction={{base: 'column', large: 'column'}}
            padding="1rem"
            width="100%"
            style={{display: "block", margin: "10px auto"}}
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
                    onSubmit={(value) => CallSearch(value)}
                />
            </Flex>
            {resultItems.length > 0 && resultItems[0].name && <Flex direction={{base: 'row', large: 'row'}}
                                                                    padding="1rem"
                                                                    width="100%"
                                                                    style={{alignItems: "center"}}
            >
                <Flex
                    direction={{base: 'column', large: 'column'}}
                    padding="1rem"
                    width="20%"
                    height="600px"
                >
                    <Heading level={6} style={{textAlign: "center", color: "#003181"}}>Filter Relations</Heading>
                    <ul style={{textDecoration: 'none', listStyle: 'none'}}>
                        {relationNames.map((name, index) => {
                            return (
                                <li key={index}>
                                    <CheckboxField
                                        name={name}
                                        value="yes"
                                        onChange={(e) => handleChecked(e)}
                                        defaultChecked
                                        label={name}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </Flex>
                {(chartOptions.series[0].data.length > 0) &&
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} containerProps={{
                        style: {
                            height: "600px",
                            display: "block",
                            width: "60%",
                            margin: "0 auto",
                        }
                    }}/>}
                <Flex
                    direction={{base: 'column', large: 'column'}}
                    padding="1rem"
                    width="20%"
                    height="600px"
                >
                    <Heading level={6} style={{textAlign: "center", color: "#003181"}}>Attributes</Heading>
                    <Table
                        className="my-custom-table"
                        caption=""
                        highlightOnHover="true">
                        <TableBody>
                            <TableRow key='name'>
                                <TableCell>
                                    name
                                </TableCell>
                                <TableCell>
                                    {(resultItems[0]['label'] === 'document' || resultItems[0]['label'] === 'drawing') && (
                                        <a target='_blank' href={resultItems[0]['PreSignedURL']}>{resultItems[0]['name']}</a>
                                    )}
                                    {(resultItems[0]['label'] !== 'document' && resultItems[0]['label'] !== 'drawing') && (
                                        <strong>{resultItems[0]['name']}</strong>
                                    )}
                                </TableCell>
                            </TableRow>
                            <TableRow key='label'>
                                <TableCell>
                                    label
                                </TableCell>
                                <TableCell>
                                    <strong>{resultItems[0]['label']}</strong>
                                </TableCell>
                            </TableRow>
                            {Object.keys(resultItems[0]).map(key => {
                                if(key !== 'name' && key !== 'label' && key !== 'PreSignedURL') {
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
                                }})}
                        </TableBody>
                    </Table>
                </Flex>
            </Flex>}
        </Flex>

    );
};

export default GraphSearch;