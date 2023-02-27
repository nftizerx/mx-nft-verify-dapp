import React, { useState } from 'react';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';
import { CopyButton } from '@multiversx/sdk-dapp/UI/CopyButton';
import { useFormik } from 'formik';
import { useApiRequests } from 'hooks/network';
import { BuildFormInputGroup } from './components';
import { validationSchema } from './validation';

interface BuildFormValuesType {
  collectionId: string;
  callbackUrl: string;
  age: string;
}

export const Build = () => {
  const [generatedUrl, setGeneratedUrl] = useState<string>('');

  const {
    network: { apiAddress }
  } = useGetNetworkConfig();

  const { getCollectionNfts } = useApiRequests();

  const initialValues: BuildFormValuesType = {
    collectionId: '',
    callbackUrl: '',
    age: '1 day'
  };

  const showComputedUrl = (values: BuildFormValuesType) => {
    const { collectionId, callbackUrl, age } = values;
    const domain = new URL(`${window.location.origin}/verify`);

    domain.searchParams.append('collectionId', collectionId);

    if (callbackUrl) {
      domain.searchParams.append('callbackUrl', callbackUrl);
    }
    domain.searchParams.append('age', age);

    setGeneratedUrl(domain.href);
  };

  const onSubmit = async (values: BuildFormValuesType) => {
    // Before computing the URL, at first we must validate that the collectionId is valid
    const response = await getCollectionNfts({
      apiAddress,
      collection: values.collectionId
    });

    if (!response.data) {
      setErrors({
        ...errors,
        collectionId: 'This collection does not exist'
      });

      return;
    }

    showComputedUrl(values);
  };

  const {
    values,
    handleChange,
    errors,
    setErrors,
    touched,
    handleBlur,
    handleSubmit
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit
  });

  const isCollectionIdError =
    'collectionId' in errors && 'collectionId' in touched;

  const isCallbackUrlError =
    'callbackUrl' in errors && 'callbackUrl' in touched;

  return (
    <section className='build d-flex flex-column justify-content-center flex-fill align-items-center container'>
      <form className='build-form' onSubmit={handleSubmit}>
        <BuildFormInputGroup
          id='collectionId'
          placeholder='E.g. MOS-b9b4b2'
          labelValue='Collection ID *'
          value={values.collectionId}
          onChange={handleChange}
          onBlur={handleBlur}
          isError={isCollectionIdError}
          error={errors.collectionId}
        />

        <BuildFormInputGroup
          id='callbackUrl'
          placeholder='E.g. https://example.com'
          labelValue='Callback URL'
          value={values.callbackUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          isError={isCallbackUrlError}
          error={errors.callbackUrl}
        />
        <div className='form-group'>
          <label htmlFor='age'>Age</label>
          <select className='form-control' id='age' onChange={handleChange}>
            <option>1 hour</option>
            <option selected>1 day</option>
            <option>1 week</option>
            <option>1 month</option>
            <option>1 year</option>
          </select>
        </div>
        <button type='submit' className='btn btn-primary'>
          Generate URL
        </button>
      </form>

      <div className='d-flex align-items-center'>
        <div className='build-generated-url'>{generatedUrl}</div>
        {generatedUrl && <CopyButton text={generatedUrl} />}
      </div>
    </section>
  );
};
