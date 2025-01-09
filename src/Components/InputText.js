import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

class InputText extends Component {
    @observable txt = this.props.defaultValue || '';

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <input
                type="text"
                className={this.props.className}
                style={this.props.style}
                value={this.txt}
                defaultValue={this.props.defaultValue}
                onChange={e => {
                    this.txt = e.target.value;
                    this.props.onChangeCb(this.txt);
                }}
                placeholder={this.props.placeholder}
            />
        );
    };
};

export default observer(InputText);