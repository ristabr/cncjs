/* eslint import/no-dynamic-require: 0 */
import series from 'async/series';
import chainedFunction from 'chained-function';
import moment from 'moment';
import pubsub from 'pubsub-js';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
    Route
} from 'react-router-dom';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import XHR from 'i18next-xhr-backend';
import { TRACE, DEBUG, INFO, WARN, ERROR } from 'universal-logger';
import settings from './config/settings';
import alert from './lib/alert';
import controller from './lib/controller';
import i18n from './lib/i18n';
import log from './lib/log';
import { toQueryObject } from './lib/query';
import user from './lib/user';
import store from './store';
import defaultState from './store/defaultState';
import App from './containers/App';
import Login from './containers/Login';
import Anchor from './components/Anchor';
import { Button } from './components/Buttons';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/vendor.styl';
import './styles/app.styl';

const renderPage = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    ReactDOM.render(
        <Router>
            <div>
                <Route path="/login" component={Login} />
                <ProtectedRoute path="/" component={App} />
            </div>
        </Router>,
        container
    );
};

series([
    (next) => {
        const queryparams = toQueryObject(window.location.search);
        const level = {
            trace: TRACE,
            debug: DEBUG,
            info: INFO,
            warn: WARN,
            error: ERROR
        }[queryparams.log_level || settings.log.level];
        log.setLevel(level);
        next();
    },
    (next) => {
        i18next
            .use(XHR)
            .use(LanguageDetector)
            .init(settings.i18next, (t) => {
                next();
            });
    },
    (next) => {
        const locale = i18next.language;
        if (locale === 'en') {
            next();
            return;
        }

        require('bundle-loader!moment/locale/' + locale)(() => {
            log.debug(`moment: locale=${locale}`);
            moment().locale(locale);
            next();
        });
    },
    (next) => {
        const token = store.get('session.token');
        user.signin({ token: token })
            .then(({ authenticated, token }) => {
                if (authenticated) {
                    log.debug('Create and establish a WebSocket connection');
                    controller.connect(() => {
                        // @see "src/web/containers/Login/Login.jsx"
                        next();
                    });
                    return;
                }
                next();
            });
    }
], (err, results) => {
    log.info(`${settings.name} ${settings.version}`);

    // Cross-origin communication
    window.addEventListener('message', (event) => {
        // TODO: event.origin

        const { token = '', action } = { ...event.data };

        // Token authentication
        if (token !== store.get('session.token')) {
            log.warn(`Received a message with an unauthorized token (${token}).`);
            return;
        }

        const { type, payload } = { ...action };
        if (type === 'connect') {
            pubsub.publish('message:connect', payload);
        } else {
            log.warn(`No valid action type (${type}) specified in the message.`);
        }
    }, false);

    { // Prevent browser from loading a drag-and-dropped file
      // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
        window.addEventListener('dragover', (e) => {
            e = e || event;
            e.preventDefault();
        }, false);

        window.addEventListener('drop', (e) => {
            e = e || event;
            e.preventDefault();
        }, false);
    }

    { // Hide loading
        const loading = document.getElementById('loading');
        loading && loading.remove();
    }

    { // Change backgrond color after loading complete
        const body = document.querySelector('body');
        body.style.backgroundColor = '#222'; // sidebar background color
    }

    if (settings.error.corruptedWorkspaceSettings) {
        const text = store.getConfig();
        const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
        const filename = `${settings.name}-${settings.version}.json`;
        const message = (
            <div style={{ display: 'flex' }}>
                <i className="fa fa-exclamation-circle fa-4x" style={{ color: '#faca2a' }} />
                <div style={{ marginLeft: 25 }}>
                    <h5>{i18n._('Corrupted workspace settings')}</h5>
                    <p>{i18n._('The workspace settings have become corrupted or invalid. Click Restore Defaults to restore default settings and continue.')}</p>
                    <div>
                        <Anchor
                            href={url}
                            download={filename}
                        >
                            <i className="fa fa-download" />
                            <span className="space space-sm" />
                            {i18n._('Download workspace settings')}
                        </Anchor>
                    </div>
                </div>
            </div>
        );
        const props = {
            button: (props) => {
                const onClick = chainedFunction(
                    () => {
                        // Reset to default state
                        store.state = defaultState;

                        // Persist data locally
                        store.persist();
                    },
                    // Dismiss
                    props.onClick
                );

                return (
                    <Button
                        btnStyle="danger"
                        onClick={onClick}
                    >
                        {i18n._('Restore Defaults')}
                    </Button>
                );
            }
        };

        alert(message, props)
            .then(renderPage);

        return;
    }

    renderPage();
});
