import { css } from '@emotion/css';

export const getStyles = (width: number, height: number) => {
  return {
    wrapper: css`
      position: relative;
      width: ${width}px;
      height: ${height}px;
    `,
  };
};
