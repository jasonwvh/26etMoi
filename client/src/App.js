import { useState } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import {
    Tooltip,
    Cell,
    ResponsiveContainer,
    Pie,
    PieChart,
    Legend,
} from "recharts";
import logo from "./logo.png";
import "./App.css";

const COLORS = [
    "#003f5c",
    "#444e86",
    "#955196",
    "#dd5182",
    "#ff6e54",
    "#ffa600",
];
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
            fontSize={20}
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

function App() {
    const [DNAData, setDNAData] = useState();
    const [country, setCountry] = useState("USA");
    const [text, setText] = useState("Here is a sample text");
    const [countryValid, setCountryValid] = useState(true);
    const [textValid, setTextValid] = useState(true);

    const checkCountryValid = (event) => {
        const form = event.currentTarget;

        if (form.value.length === 3) {
            setCountryValid(true);
        } else {
            setCountryValid(false);
        }
    };

    const checkTextValid = (event) => {
        const form = event.currentTarget;

        if (form.value.length > 0) {
            setTextValid(true);
        } else {
            setTextValid(false);
        }
    };

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
            <div className="form">
                <img src={logo} alt="logo" />
                <Form onSubmit={onSubmit}>
                    <Form.Group controlId="form-country">
                        <Form.Label>
                            Where are you from? (i.e. USA, CAN)
                        </Form.Label>
                        <Form.Control
                            isInvalid={!countryValid}
                            type="text"
                            value={country}
                            onChange={(e) => {
                                checkCountryValid(e);
                                setCountry(e.target.value);
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter 3-letter ISO code.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="form-text">
                        <Form.Label>Enter text here</Form.Label>
                        <Form.Control
                            isInvalid={!textValid}
                            value={text}
                            onChange={(e) => {
                                checkTextValid(e);
                                setText(e.target.value);
                            }}
                            as="textarea"
                            rows={5}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please input something
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div style={{ textAlign: "center" }}>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </div>
                </Form>
            </div>
            {DNAData && (
                <div className="charts-wrapper">
                    <h3>Your Text DNA</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Tooltip
                                cursor={{ stroke: "red", strokeWidth: 2 }}
                            />
                            <Legend
                                iconSize={15}
                                iconType="rect"
                                verticalAlign="bottom"
                                wrapperStyle={{
                                    paddingTop: "20px",
                                    text: "#FFFFFF",
                                }}
                                textAnchor
                            />
                            <Pie
                                data={DNAData}
                                labelLine={true}
                                label={renderCustomizedLabel}
                                innerRadius={130}
                                outerRadius={160}
                                paddingAngle={2}
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
                    <br />
                    <h6>*Checked against every records in our database</h6>
                </div>
            )}
        </div>
    );
}

export default App;
