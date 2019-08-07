import * as React from "react";
import { HealthChecksClient } from "../healthChecksClient";
import { PollingInterval, getConfiguredInterval } from "./PollingInterval";
import moment from "moment";
import { Liveness } from "../typings/models";
import { LivenessTable } from "./LivenessTable";
import { parse } from "path";
const DarkHeartIcon = require("../../assets/svg/dark-heart.svg");
const ExpandIcon = require('../../assets/svg/expand.svg');
const CollapseIcon = require('../../assets/svg/collapse.svg');
const PlusIcon = require("../../assets/svg/plus.svg");
const MinusIcon = require('../../assets/svg/minus.svg');


interface LivenessState {
    error: Nullable<string>;
    livenessData: Array<Liveness>;
}

interface LivenessProps {
    endpoint: string
}

export class LivenessPage extends React.Component<LivenessProps, LivenessState> {
    private _healthChecksClient: HealthChecksClient;
    private _lifenessTable: any;
    constructor(props: LivenessProps) {
        super(props);
        this._healthChecksClient = new HealthChecksClient(this.props.endpoint);
        this.expandAll = this.expandAll.bind(this);
        this.collapseAll = this.collapseAll.bind(this);

        this.state = {
            error: '',
            livenessData: []
        }
    }

    componentDidMount() {
        this.load();
        this.initPolling();
    }

    async load() {
        try {

            let livenessCollection = (await this._healthChecksClient.getData()).data as Array<Liveness>;
            livenessCollection = livenessCollection.filter(l => l != null);

            for (let item of livenessCollection) {
                item.onStateFrom = `${item.status} ${moment.utc(item.onStateFrom).fromNow()}`;
            }

            if (livenessCollection && livenessCollection.length > 0) {
                this.setState({
                    livenessData: livenessCollection
                });
            }
        }
        catch (error) {
            this.setState({
                error: 'Could not retrieve health checks data'
            });
            console.error(error);
        };
    }

    initPolling = () => this._healthChecksClient.startPolling(getConfiguredInterval() * 1000, this.onPollingElapsed);
    
    onPollingElapsed = () => {
        this.setState({ error: '' });
        this.load();
    }

    componentWillUnmount() {
        this._healthChecksClient.stopPolling();
    }

    expandAll(event: any) {
        var tableElement = this._lifenessTable;
        Array.from(tableElement.getElementsByClassName("tr-liveness"))
            .map((el: any) => el.nextSibling)
            .forEach((el: any) => el.classList.remove("hidden"));

            Array.from(tableElement.getElementsByClassName("plus-icon"))            
            .forEach((el: any) => el.src = MinusIcon);
    }

    collapseAll(event: any) {
        var tableElement = this._lifenessTable;
        Array.from(tableElement.getElementsByClassName("tr-liveness"))
            .map((el: any) => el.nextSibling)
            .forEach((el: any) => el.classList.add("hidden"));
        
            Array.from(tableElement.getElementsByClassName("plus-icon"))            
            .forEach((el: any) => el.src = PlusIcon);
    }

    render() {
        return <div id="wrapper" style={{ height: '100%', overflow: 'auto' }}>
            <div className="container liveness-container">
                <div className="row top-buffer-100">
                    <div className="header-logo">
                        <img src={DarkHeartIcon} className="logo-icon" /><h2 className="title">Health Checks status</h2>
                    </div>
                    <div className="col text-right">
                        <PollingInterval onChange={this.initPolling} />
                    </div>
                </div>
            </div>
            <div className="container liveness-container">
                <div className="row text-right bottom-buffer-10">
                    <div className="col-md-12">
                        <img className="expand-button" src={ExpandIcon} title="Expand all" onClick={this.expandAll} />
                        <img className="collapse-button" src={CollapseIcon} title="Collapse all" onClick={this.collapseAll} />
                    </div>
                </div>
                <div className="row bottom-buffer-60" ref={(lt) => this._lifenessTable = lt}>
                    <LivenessTable livenessData={this.state.livenessData} />
                    {this.state.error ?
                        <div className="w-100 alert alert-danger" role="alert">{this.state.error}</div>
                        : null
                    }
                </div>
            </div >
        </div>

    }
}