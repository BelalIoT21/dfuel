
import React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface MachineDescriptionProps {
  description: string;
}

const MachineDescription = ({ description }: MachineDescriptionProps) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Description</Title>
        <Paragraph>{description}</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});

export default MachineDescription;
