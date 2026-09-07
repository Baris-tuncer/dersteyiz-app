import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir sorun oluştu</Text>
          <Text style={styles.subtitle}>
            Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen tekrar deneyin.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnDark,
  },
});
