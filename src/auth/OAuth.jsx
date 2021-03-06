import React, { Component } from 'react';
import { connect } from 'react-redux';

import { API_URL } from './config';
import { signInWithOAuth, saveCurrentAuthProvider, destroyOAuthSession } from '../actions/UserActions';

import './style.css';

class OAuth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: ''
        };
    }

    componentDidMount() {
        const { socket, provider } = this.props;

        socket.on(provider, (user) => {
            if (this.popup !== undefined) {
                this.popup.close();
            }

            const {
                signInWithOAuth: signInWithOAuthAction,
                saveCurrentAuthProvider: saveCurrentAuthProviderAction
            } = this.props;
            signInWithOAuthAction(user);
            saveCurrentAuthProviderAction(provider);
        });
    }

    checkPopup() {
        const check = setInterval(() => {
            const { popup } = this;
            if (!popup || popup.closed || popup.closed === undefined) {
                clearInterval(check);
                this.setState({ disabled: '' });
            }
        }, 1000);
    }

    openPopup() {
        const { provider, socket } = this.props;
        const width = 600;
        const height = 600;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);
        const url = `${API_URL}/${provider}?socketId=${socket.id}`;

        return window.open(url, '',
            `toolbar=no, location=no, directories=no, status=no, menubar=no, 
            scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
            height=${height}, top=${top}, left=${left}
        `);
    }

    startAuth() {
        const { disabled } = this.state;
        if (!disabled) {
            this.popup = this.openPopup();
            this.checkPopup();
            this.setState({ disabled: 'disabled' });
        }
    }

    render() {
        const {
            login,
            provider,
            destroyOAuthSession: destroyOAuthSessionAction
        } = this.props;
        const { name, photo } = login;
        const { disabled } = this.state;
        const atSymbol = provider === 'twitter' ? '@' : '';

        return (
            <div>
                {(name)
                    ? (
                        <div className="card">
                            <img src={photo} alt={name} onClick={destroyOAuthSessionAction} />
                            <h4>{`${atSymbol}${name}`}</h4>
                        </div>
                    )
                    : (
                        <div className="button-wrapper fadein-fast">
                            <button
                                type="button"
                                onClick={this.startAuth.bind(this)}
                                className={`${provider} ${disabled} button`}
                            >
                                <i className={`fab fa-${provider}`} />
                            </button>
                        </div>
                    )
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        login: state.login,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        signInWithOAuth: login => dispatch(signInWithOAuth(login)),
        saveCurrentAuthProvider: provider => dispatch(saveCurrentAuthProvider(provider)),
        destroyOAuthSession: () => dispatch(destroyOAuthSession())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OAuth);
