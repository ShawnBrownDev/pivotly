/**
 * Biometric authentication service using expo-local-authentication.
 * Supports Face ID (iOS), Touch ID (iOS), and Fingerprint (Android).
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'face' | 'fingerprint' | null;

export type BiometricStatus = {
  available: boolean;
  enrolled: boolean;
  type: BiometricType;
  label: string;
};

/**
 * Check if device has biometric hardware.
 */
export async function hasBiometricHardware(): Promise<boolean> {
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

/**
 * Check if user has enrolled biometrics (fingerprint or face).
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  try {
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

/**
 * Get supported authentication types (FINGERPRINT=1, FACIAL_RECOGNITION=2).
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'face';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get human-readable label for the biometric type.
 */
export function getBiometricLabel(type: BiometricType): string {
  if (type === 'face') {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face';
  }
  if (type === 'fingerprint') {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }
  return 'Biometrics';
}

/**
 * Full status: hardware, enrollment, type, and label.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  const [hardware, enrolled, type] = await Promise.all([
    hasBiometricHardware(),
    isBiometricEnrolled(),
    getBiometricType(),
  ]);
  const available = hardware && enrolled && type !== null;
  return {
    available,
    enrolled: hardware && enrolled,
    type,
    label: getBiometricLabel(type),
  };
}

export type AuthenticateOptions = {
  promptMessage?: string;
  fallbackLabel?: string;
};

/**
 * Prompt for biometric authentication.
 * Returns { success: true } on success, { success: false } on cancel/failure.
 */
export async function authenticate(
  options?: AuthenticateOptions
): Promise<{ success: boolean }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options?.promptMessage ?? 'Authenticate to sign in',
      fallbackLabel: options?.fallbackLabel ?? 'Use password',
    });
    return { success: result.success };
  } catch {
    return { success: false };
  }
}
