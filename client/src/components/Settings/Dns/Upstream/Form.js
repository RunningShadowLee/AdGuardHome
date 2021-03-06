import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Trans, useTranslation } from 'react-i18next';
import classnames from 'classnames';

import Examples from './Examples';
import { renderRadioField, renderTextareaField } from '../../../../helpers/form';
import { DNS_REQUEST_OPTIONS, FORM_NAME, UPSTREAM_CONFIGURATION_WIKI_LINK } from '../../../../helpers/constants';
import { testUpstream } from '../../../../actions';
import { removeEmptyLines } from '../../../../helpers/helpers';

const UPSTREAM_DNS_NAME = 'upstream_dns';

const Title = () => {
    const components = {
        a: <a href={UPSTREAM_CONFIGURATION_WIKI_LINK} target="_blank"
              rel="noopener noreferrer" />,
    };

    return <label className="form__label" htmlFor={UPSTREAM_DNS_NAME}>
        <Trans components={components}>upstream_dns_help</Trans>
    </label>;
};

const getInputFields = (upstream_dns_file) => [
    {
        getTitle: Title,
        name: UPSTREAM_DNS_NAME,
        type: 'text',
        value: 'test',
        component: renderTextareaField,
        className: 'form-control form-control--textarea font-monospace',
        placeholder: 'upstream_dns',
        normalizeOnBlur: removeEmptyLines,
        disabled: !!upstream_dns_file,
    },
    {
        name: 'upstream_mode',
        type: 'radio',
        value: DNS_REQUEST_OPTIONS.LOAD_BALANCING,
        component: renderRadioField,
        subtitle: 'load_balancing_desc',
        placeholder: 'load_balancing',
    },
    {
        name: 'upstream_mode',
        type: 'radio',
        value: DNS_REQUEST_OPTIONS.PARALLEL,
        component: renderRadioField,
        subtitle: 'upstream_parallel',
        placeholder: 'parallel_requests',
    },
    {
        name: 'upstream_mode',
        type: 'radio',
        value: DNS_REQUEST_OPTIONS.FASTEST_ADDR,
        component: renderRadioField,
        subtitle: 'fastest_addr_desc',
        placeholder: 'fastest_addr',
    },
];

const Form = ({
    submitting, invalid, handleSubmit,
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const upstream_dns = useSelector((store) => store.form[FORM_NAME.UPSTREAM].values.upstream_dns);
    const bootstrap_dns = useSelector(
        (store) => store.form[FORM_NAME.UPSTREAM].values.bootstrap_dns,
    );
    const upstream_dns_file = useSelector((state) => state.dnsConfig.upstream_dns_file);
    const processingTestUpstream = useSelector((state) => state.settings.processingTestUpstream);
    const processingSetConfig = useSelector((state) => state.dnsConfig.processingSetConfig);

    const handleUpstreamTest = () => dispatch(testUpstream({
        upstream_dns,
        bootstrap_dns,
    }));

    const testButtonClass = classnames('btn btn-primary btn-standard mr-2', {
        'btn-loading': processingTestUpstream,
    });

    const INPUT_FIELDS = getInputFields(upstream_dns_file);

    return <form onSubmit={handleSubmit}>
        <div className="row">
            {INPUT_FIELDS.map(({
                name, component, type, className, placeholder,
                getTitle, subtitle, disabled, value, normalizeOnBlur,
            }) => <div className="col-12 mb-4" key={placeholder}>
                {typeof getTitle === 'function' && getTitle()}
                <Field
                    id={name}
                    value={value}
                    name={name}
                    component={component}
                    type={type}
                    className={className}
                    placeholder={t(placeholder)}
                    subtitle={t(subtitle)}
                    disabled={processingSetConfig || processingTestUpstream || disabled}
                    normalizeOnBlur={normalizeOnBlur}
                />
            </div>)}
            <div className="col-12">
                <Examples />
                <hr />
            </div>
            <div className="col-12 mb-4">
                <label
                    className="form__label form__label--with-desc"
                    htmlFor="bootstrap_dns"
                >
                    <Trans>bootstrap_dns</Trans>
                </label>
                <div className="form__desc form__desc--top">
                    <Trans>bootstrap_dns_desc</Trans>
                </div>
                <Field
                    id="bootstrap_dns"
                    name="bootstrap_dns"
                    component={renderTextareaField}
                    type="text"
                    className="form-control form-control--textarea form-control--textarea-small font-monospace"
                    placeholder={t('bootstrap_dns')}
                    disabled={processingSetConfig}
                    normalizeOnBlur={removeEmptyLines}
                />
            </div>
        </div>
        <div className="card-actions">
            <div className="btn-list">
                <button
                    type="button"
                    className={testButtonClass}
                    onClick={handleUpstreamTest}
                    disabled={!upstream_dns || processingTestUpstream}
                >
                    <Trans>test_upstream_btn</Trans>
                </button>
                <button
                    type="submit"
                    className="btn btn-success btn-standard"
                    disabled={
                        submitting || invalid || processingSetConfig || processingTestUpstream
                    }
                >
                    <Trans>apply_btn</Trans>
                </button>
            </div>
        </div>
    </form>;
};

Form.propTypes = {
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    initialValues: PropTypes.object,
    upstream_dns: PropTypes.string,
    bootstrap_dns: PropTypes.string,
};

export default reduxForm({ form: FORM_NAME.UPSTREAM })(Form);
