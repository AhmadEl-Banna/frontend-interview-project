import React, { FC, useEffect, useReducer } from 'react';
import classnames from 'classnames';
import styles from './image.module.scss';

interface Props {
  src: Src;
  className?: string;
  alt?: string;
}

enum ActionTypes {
  SET_RESOURCE = 'SET_RESOURCE',
  LOADING_ERROR = 'LOADING_ERROR',
  LOADING_COMPLETE = 'LOADING_COMPLETE',
}
interface State {
  src: string | undefined;
  isLoadingError: boolean;
  isLoadingComplete: boolean;
}

const initialState: State = {
  src: undefined,
  isLoadingError: false,
  isLoadingComplete: false,
};

interface BaseAction {
  type: ActionTypes;
}
interface Action<T> extends BaseAction {
  payload: T;
}

function setResource(source: string): Action<string> {
  return {
    type: ActionTypes.SET_RESOURCE,
    payload: source,
  };
}

function loadingError(): BaseAction {
  return {
    type: ActionTypes.LOADING_ERROR,
  };
}

function loadingComplete(): BaseAction {
  return {
    type: ActionTypes.LOADING_COMPLETE,
  };
}
function reducer(state: State, action: BaseAction): State {
  switch (action.type) {
    case ActionTypes.SET_RESOURCE:
      return { ...state, src: (action as Action<string>).payload };
    case ActionTypes.LOADING_COMPLETE:
      return { ...state, isLoadingComplete: true, isLoadingError: false };
    case ActionTypes.LOADING_ERROR:
      return { ...state, isLoadingComplete: false, isLoadingError: true };
    default:
      return state;
  }
}

const Image: FC<Props> = (props) => {
  const { className, src, alt, ...otherProps } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSource = async (source: Src): Promise<void> => {
    if (typeof source === 'string') {
      dispatch(setResource(source));
      return;
    }

    try {
      const result = await source();
      dispatch(setResource(result));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Image] handleSource', e);
      dispatch(loadingError());
    }
  };

  const handleLoad = (): void => {
    dispatch(loadingComplete());
  };

  const handleError = (): void => {
    dispatch(loadingError());
  };

  useEffect(() => {
    handleSource(src);
  }, [src]);

  const rootClass = classnames(
    {
      [styles.image]: true,
      [styles.error]: state.isLoadingError,
      [styles.complete]: state.isLoadingComplete,
    },
    className,
  );

  return (
    <img
      {...otherProps}
      className={rootClass}
      onError={handleError}
      onLoad={handleLoad}
      src={state.src}
      alt={alt}
    />
  );
};

export default Image;
