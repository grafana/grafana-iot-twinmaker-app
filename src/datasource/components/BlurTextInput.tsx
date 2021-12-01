import React, { PureComponent } from 'react';
import { Input } from '@grafana/ui';

interface Props {
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value?: string) => void;
  width?: number;
}

interface State {
  text: string;
}

/**
 * This is an Input field that will call `onChange` for blur and enter
 * this avoids sending updates on every keypress
 */
export class BlurTextInput extends PureComponent<Props, State> {
  state: State = { text: '' };

  componentDidMount() {
    this.setState({
      text: this.props.value ?? '',
    });
  }

  componentDidUpdate(oldProps: Props) {
    if (this.props.value !== oldProps.value) {
      this.setState({
        text: this.props.value ?? '',
      });
    }
  }

  onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  };

  onChange = (e: React.FocusEvent<HTMLInputElement>) => {
    this.setState({
      text: e.currentTarget.value,
    });
  };

  onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.onBlur(e as any);
    }
  };

  render() {
    const { placeholder, width, autoFocus } = this.props;
    const { text } = this.state;
    return (
      <Input
        autoFocus={autoFocus}
        width={width}
        value={text}
        onChange={this.onChange}
        onBlur={this.onBlur}
        onKeyPress={this.onKeyPress}
        placeholder={placeholder}
      />
    );
  }
}
