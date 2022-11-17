import { css } from '@emotion/css';

export const getStyles = (width: number) => {
  return {
    wrapper: css`
      position: relative;
      width: ${width}px;
    `,
  };
};
