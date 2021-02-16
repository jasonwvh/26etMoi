import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { Cell, ResponsiveContainer, Pie, PieChart, Legend } from "recharts";
import "./App.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill={COLORS[index % COLORS.length]}
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
const apiURL = "http://localhost:5000";
const getData = (async) => {
    axios.get(`${apiURL}/api/get/all`).then((res) => {
        const data = res.data;
        //console.log(data);
    });
};

function App() {
    const [DNAData, setDNAData] = useState([
        { name: "US", value: 0.2 },
        { name: "MY", value: 0.2 },
        { name: "IN", value: 0.5 },
        { name: "DE", value: 0.1 },
    ]);

    const [country, setCountry] = useState("US");
    const [text, setText] = useState("Test");

    useEffect(() => {
        getData();
    }, []);

    const onSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        axios.post(`${apiURL}/api/post`, { country, text }).then((res) => {
            let dat = res.data;
            let dna = [];

            for (const [key, value] of Object.entries(dat)) {
                dna.push({
                    name: key,
                    value: value,
                });
            }

            setDNAData(dna);
        });
    };

    return (
        <div className="App">
            <Form onSubmit={onSubmit}>
                <Form.Group controlId="form.country">
                    <Form.Label>Where are you from?</Form.Label>
                    <Form.Control
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        as="select"
                    >
                        <option>MY</option>
                        <option>US</option>
                        <option>DE</option>
                        <option>IN</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="form.text">
                    <Form.Label>Enter text here</Form.Label>
                    <Form.Control
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        as="textarea"
                        rows={3}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>

            <ResponsiveContainer height={250}>
                <PieChart height={250}>
                    <Legend verticalAlign="top" />
                    <Pie
                        data={DNAData}
                        labelLine={false}
                        label={renderCustomizedLabel}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {DNAData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default App;
