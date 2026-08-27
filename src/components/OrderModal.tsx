import React, { useReducer, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { STUDENT, examStamp, VARIANT } from '../constants/student';
import { Product } from '../services/productApi';

interface OrderModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  isTimeUp: boolean;
  isDarkMode: boolean;
}

type State = {
  quantity: number;
};

type Action = { type: 'ADD' } | { type: 'REMOVE' } | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      return { quantity: state.quantity + 1 };
    case 'REMOVE':
      return { quantity: state.quantity > 1 ? state.quantity - 1 : 1 };
    case 'RESET':
      return { quantity: 1 };
    default:
      return state;
  }
}

export function OrderModal({
  visible,
  product,
  onClose,
  isTimeUp,
  isDarkMode,
}: OrderModalProps) {
  const [state, dispatch] = useReducer(reducer, { quantity: 1 });

  // Reset quantity when modal opens or product changes
  useEffect(() => {
    if (visible) {
      dispatch({ type: 'RESET' });
    }
  }, [visible, product]);

  if (!product) return null;

  const handleConfirm = () => {
    if (isTimeUp) return;

    const stamp = examStamp();
    const alertTitle = `CampusMart · ${STUDENT.mssv}`;
    const alertMessage = `${STUDENT.hoTen} (#${stamp}) đã ghi nhận: ${product.title} x ${state.quantity}. Nhận tại quầy KTX.`;

    Alert.alert(alertTitle, alertMessage, [
      {
        text: 'Xong',
        onPress: () => {
          onClose();
        },
      },
    ]);
  };

  const colors = {
    background: isDarkMode ? '#042F2E' : '#F0FDFA',
    surface: isDarkMode ? '#0B4F4A' : '#FFFFFF',
    text: isDarkMode ? '#F0FDFA' : '#134E4A',
    textLight: isDarkMode ? '#A5F3FC' : '#5F7A77',
    primary: '#07766E',
    border: isDarkMode ? '#115E59' : '#CCFBF1',
  };

  const stamp = examStamp();
  const watermarkText = `TH1 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${stamp}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={VARIANT.modalAnimation}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Watermark position at top or bottom depending on VARIANT.watermarkAtTop */}
        {VARIANT.watermarkAtTop && (
          <View style={styles.watermarkWrapperTop}>
            <Text style={[styles.watermarkText, { color: colors.textLight }]}>
              {watermarkText}
            </Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Product Details */}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {product.title}
          </Text>
          
          <Text style={styles.price}>{product.displayPrice}</Text>
          
          <Text style={[styles.category, { color: colors.textLight }]}>
            Danh mục: {product.category}
          </Text>
          
          <Text style={[styles.description, { color: colors.textLight }]} numberOfLines={2}>
            {product.description || 'Chưa có mô tả ngắn cho sản phẩm này.'}
          </Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.qtyBtn,
                { borderColor: colors.primary, backgroundColor: pressed ? colors.border : 'transparent' }
              ]}
              onPress={() => dispatch({ type: 'REMOVE' })}
            >
              <Text style={[styles.qtyBtnText, { color: colors.primary }]}>−</Text>
            </Pressable>

            <Text style={[styles.qtyText, { color: colors.text }]}>{state.quantity}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.qtyBtn,
                { borderColor: colors.primary, backgroundColor: pressed ? colors.border : 'transparent' }
              ]}
              onPress={() => dispatch({ type: 'ADD' })}
            >
              <Text style={[styles.qtyBtnText, { color: colors.primary }]}>+</Text>
            </Pressable>
          </View>

          {/* Confirm Button */}
          {isTimeUp ? (
            <View style={[styles.disabledBtn, { backgroundColor: '#9CA3AF' }]}>
              <Text style={styles.disabledBtnText}>Hết giờ flash-sale</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.confirmBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>Xác nhận đặt</Text>
            </Pressable>
          )}

          {/* Close Button */}
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: colors.primary }]}>Đóng</Text>
          </Pressable>
        </View>

        {!VARIANT.watermarkAtTop && (
          <View style={styles.watermarkWrapperBottom}>
            <Text style={[styles.watermarkText, { color: colors.textLight }]}>
              {watermarkText}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#07766E',
    marginBottom: 6,
  },
  category: {
    fontSize: 13,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 20,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledBtnText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  watermarkWrapperTop: {
    position: 'absolute',
    top: 40,
    width: '100%',
    alignItems: 'center',
  },
  watermarkWrapperBottom: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.8,
  },
});
