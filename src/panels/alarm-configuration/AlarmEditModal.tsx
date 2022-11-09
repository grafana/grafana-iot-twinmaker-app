import React, { useCallback, useState } from 'react';
import { Button, Field, Input, Modal } from '@grafana/ui';

interface AlarmEditProps {
  isOpen: boolean;
  currentThreshold: number;
  onDismiss: () => void;
  onSave: (newThreshold: number) => void;
}

export const AlarmEditModal: React.FunctionComponent<AlarmEditProps> = ({
  isOpen,
  onDismiss,
  onSave,
  currentThreshold,
}) => {
  const [thresholdValue, setThresholdValue] = useState(currentThreshold);

  const handleThresholdInputChange = useCallback((event: any) => {
    if (typeof event.target.value === 'string') {
      setThresholdValue(parseFloat(event.target.value));
    } else if (typeof event.target.value === 'number') {
      setThresholdValue(event.target.value);
    } else {
      console.error('unknown data type for new threshold');
    }
  }, []);

  const handleSaveClick = useCallback(() => {
    onSave(thresholdValue);
    onDismiss();
  }, [thresholdValue, onSave, onDismiss]);

  return (
    <Modal title={'Edit alarm'} isOpen={isOpen} onDismiss={onDismiss}>
      <Field label="Value">
        <Input
          id="thresholdValue"
          type="number"
          placeholder={currentThreshold.toString()}
          onChange={handleThresholdInputChange}
        />
      </Field>
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onDismiss}>
          Cancel
        </Button>
        <Button onClick={handleSaveClick}>Save</Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
