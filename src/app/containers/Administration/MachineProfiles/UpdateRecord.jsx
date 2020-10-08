import {
  Box,
} from '@trendmicro/react-styled-ui';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import Input from 'app/components/FormControl/Input';
import FormGroup from 'app/components/FormGroup';
import { Container, Row, Col } from 'app/components/GridSystem';
import Modal from 'app/components/Modal';
import { ToastNotification } from 'app/components/Notifications';
import SectionGroup from 'app/components/SectionGroup';
import SectionTitle from 'app/components/SectionTitle';
import { ensureFiniteNumber } from 'app/lib/ensure-type';
import i18n from 'app/lib/i18n';
import Error from '../common/Error';
import * as validations from '../common/validations';
import Axis from './Axis';

class UpdateRecord extends Component {
    static propTypes = {
      state: PropTypes.object,
      actions: PropTypes.object
    };

    state = this.getInitialState();

    getInitialState() {
      const values = this.props.state.modal.params;

      return {
        values: {
          name: _get(values, 'name', ''),
          limits: {
            xmin: ensureFiniteNumber(_get(values, 'limits.xmin')),
            xmax: ensureFiniteNumber(_get(values, 'limits.xmax')),
            ymin: ensureFiniteNumber(_get(values, 'limits.ymin')),
            ymax: ensureFiniteNumber(_get(values, 'limits.ymax')),
            zmin: ensureFiniteNumber(_get(values, 'limits.zmin')),
            zmax: ensureFiniteNumber(_get(values, 'limits.zmax')),
          }
        }
      };
    }

    onSubmit = (values) => {
      const { id } = this.props.state.modal.params;
      const { updateRecord } = this.props.actions;
      const forceReload = true;

      updateRecord(id, {
        name: _get(values, 'name', ''),
        limits: {
          xmin: ensureFiniteNumber(_get(values, 'limits.xmin')),
          xmax: ensureFiniteNumber(_get(values, 'limits.xmax')),
          ymin: ensureFiniteNumber(_get(values, 'limits.ymin')),
          ymax: ensureFiniteNumber(_get(values, 'limits.ymax')),
          zmin: ensureFiniteNumber(_get(values, 'limits.zmin')),
          zmax: ensureFiniteNumber(_get(values, 'limits.zmax')),
        }
      }, forceReload);
    };

    renderLimits = () => (
      <Container fluid gutterWidth={0}>
        <Row>
          <Col>
            <Field name="limits.xmin">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="X" sub="min" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
          <Col width="auto" style={{ width: 16 }} />
          <Col>
            <Field name="limits.xmax">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="X" sub="max" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
        </Row>
        <Row>
          <Col>
            <Field name="limits.ymin">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="Y" sub="min" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
          <Col width="auto" style={{ width: 16 }} />
          <Col>
            <Field name="limits.ymax">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="Y" sub="max" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
        </Row>
        <Row>
          <Col>
            <Field name="limits.zmin">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="Z" sub="min" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
          <Col width="auto" style={{ width: 16 }} />
          <Col>
            <Field name="limits.zmax">
              {({ input, meta }) => (
                <FormGroup>
                  <label><Axis value="Z" sub="max" /></label>
                  <Input {...input} type="number" />
                  {meta.touched && meta.error && <Error>{meta.error}</Error>}
                </FormGroup>
              )}
            </Field>
          </Col>
        </Row>
      </Container>
    );

    render() {
      const { closeModal, updateModalParams } = this.props.actions;
      const { alertMessage } = this.props.state.modal.params;

      return (
        <Modal
          disableOverlayClick
          onClose={closeModal}
        >
          <Form
            initialValues={this.state.values}
            onSubmit={this.onSubmit}
            render={({ handleSubmit, pristine, invalid }) => (
              <div>
                <Modal.Header>
                  <Modal.Title>
                    {i18n._('Machine Profile')}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {alertMessage && (
                    <ToastNotification
                      style={{ margin: '-16px -24px 10px -24px' }}
                      type="error"
                      onDismiss={() => {
                        updateModalParams({ alertMessage: '' });
                      }}
                    >
                      {alertMessage}
                    </ToastNotification>
                  )}
                  <SectionGroup>
                    <Field name="name" validate={validations.required}>
                      {({ input, meta }) => (
                        <FormGroup>
                          <label>{i18n._('Name')}</label>
                          <Input {...input} type="text" />
                          {meta.touched && meta.error && <Error>{meta.error}</Error>}
                        </FormGroup>
                      )}
                    </Field>
                  </SectionGroup>
                  <SectionGroup style={{ marginBottom: 0 }}>
                    <SectionTitle>{i18n._('Limits')}</SectionTitle>
                    <Box ml="6x">
                      {this.renderLimits()}
                    </Box>
                  </SectionGroup>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={closeModal}
                  >
                    {i18n._('Cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={pristine || invalid}
                    onClick={handleSubmit}
                  >
                    {i18n._('OK')}
                  </button>
                </Modal.Footer>
              </div>
            )}
          />
        </Modal>
      );
    }
}

export default UpdateRecord;
