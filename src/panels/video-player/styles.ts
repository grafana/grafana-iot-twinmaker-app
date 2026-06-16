import { css } from '@emotion/css';

export const getVideoPlayerStyles = () => {
  return {
    wrapper: css`
      position: relative;
    `,
  };
};

export const getRequestVideoUploadStyles = () => {
  return {
    wrapper: css`
      position: sticky;
      bottom: 0;
    `,
  };
}
