# 🎯 Ejemplo Práctico: Chat con Gemini en NutriCoach

## Escenario: Usuario Luis consultando sobre su progreso

### **Paso 1: Crear nueva sesión de chat**

```bash
POST /api/chat/session
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Respuesta:**
```json
{
    "success": true,
    "message": "Nueva sesión creada exitosamente",
    "data": {
        "session_id": "chat_1737031234_abc123",
        "welcome_message": "¡Hola Luis! Soy NutriCoach Luis, tu asistente nutricional personal. ¿En qué puedo ayudarte hoy?",
        "follow_up_suggestions": [
            "¿Cómo te sientes hoy?",
            "¿Quieres revisar tu progreso nutricional?",
            "¿Necesitas ayuda con algún antojo?"
        ]
    }
}
```

### **Paso 2: Usuario pregunta sobre su progreso**

```bash
POST /api/chat/send
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "message": "Hola, ¿cómo voy con mis calorías hoy? Me siento un poco preocupado",
    "session_id": "chat_1737031234_abc123",
    "message_type": "nutrition"
}
```

**Contexto que Gemini recibe:**
```
CONTEXTO DEL USUARIO:
Perfil: Masculino, 32 años, 175cm, 95kg
Objetivos diarios: 2000 kcal, 120g proteína, 200g carbohidratos, 80g grasas
Meta: pérdida_de_peso, Nivel de actividad: moderado
Hoy ha consumido: 1850 kcal, 95g proteína, 180g carbohidratos, 70g grasas
Estado actual: Estrés 6/10, Energía 7/10, Ánimo 5/10
Notas: Día de trabajo estresante
```

**Respuesta de Gemini:**
```json
{
    "success": true,
    "message": "Mensaje procesado exitosamente",
    "data": {
        "conversation_id": 1,
        "session_id": "chat_1737031234_abc123",
        "ai_response": "¡Hola Luis! Veo que hoy has consumido 1,850 calorías de tu objetivo de 2,000. Estás muy cerca de tu meta, solo te faltan 150 calorías. También noto que tu nivel de estrés está en 6/10, lo cual puede estar afectando tu percepción del progreso.\n\nTus macronutrientes están bastante bien balanceados: 95g de proteína (objetivo: 120g), 180g de carbohidratos (objetivo: 200g) y 70g de grasas (objetivo: 80g). Te sugiero agregar una merienda rica en proteína para completar tu día.\n\nRecuerda que el estrés puede hacer que te sientas más preocupado de lo necesario. ¿Te gustaría que trabajemos en algunas estrategias para manejar mejor los días estresantes?",
        "sentiment": "negative",
        "sentiment_confidence": 0.75,
        "follow_up_suggestions": [
            "¿Quieres que te sugiera una merienda rica en proteína?",
            "¿Te gustaría aprender técnicas para manejar el estrés?",
            "¿Cómo te sientes con tu progreso general esta semana?"
        ],
        "context_used": {
            "user_profile": {...},
            "today_nutrition": {...},
            "current_context": {...}
        }
    }
}
```

### **Paso 3: Usuario responde con más contexto**

```bash
POST /api/chat/send
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "message": "Sí, me gustaría una merienda con proteína. También tengo muchos antojos de dulces por el estrés",
    "session_id": "chat_1737031234_abc123",
    "message_type": "nutrition"
}
```

**Respuesta de Gemini:**
```json
{
    "success": true,
    "data": {
        "ai_response": "Perfecto, Luis. Para completar tus 25g de proteína faltantes, te sugiero:\n\n🥜 **Opción 1**: 1 taza de yogur griego natural + 1 cucharada de almendras (25g proteína)\n🥚 **Opción 2**: 2 huevos duros + 1 rebanada de pan integral (22g proteína)\n🍗 **Opción 3**: 100g de pechuga de pollo + 1 manzana (25g proteína)\n\nSobre los antojos de dulces por estrés, esto es completamente normal. Cuando estamos estresados, nuestro cuerpo busca energía rápida. Te sugiero:\n\n• Beber un vaso grande de agua\n• Comer una fruta (manzana o pera)\n• Hacer 5 respiraciones profundas\n• Dar una caminata de 5 minutos\n\n¿Cuál de estas opciones de merienda te parece más apetitosa?",
        "sentiment": "stressed",
        "sentiment_confidence": 0.85,
        "follow_up_suggestions": [
            "¿Cuál merienda prefieres?",
            "¿Quieres que te enseñe técnicas de respiración?",
            "¿Te gustaría programar recordatorios para manejar antojos?"
        ]
    }
}
```

### **Paso 4: Usuario selecciona una opción**

```bash
POST /api/chat/send
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "message": "Me gusta la opción del yogur griego con almendras. ¿Puedes ayudarme a registrarlo?",
    "session_id": "chat_1737031234_abc123",
    "message_type": "nutrition"
}
```

**Respuesta de Gemini:**
```json
{
    "success": true,
    "data": {
        "ai_response": "¡Excelente elección, Luis! El yogur griego con almendras es perfecto para completar tu día.\n\nPara registrarlo en tu app:\n\n1. Ve a la sección 'Registrar Comida'\n2. Busca 'Yogur Griego Natural'\n3. Selecciona 1 taza (240ml)\n4. Agrega 'Almendras' - 1 cucharada (15g)\n\nEsto te dará aproximadamente:\n• 25g de proteína\n• 8g de carbohidratos\n• 12g de grasas saludables\n• 220 calorías\n\nCon esto completarás perfectamente tus objetivos del día. ¿Te gustaría que te ayude a registrar alguna otra comida o tienes alguna pregunta sobre tu plan nutricional?",
        "sentiment": "positive",
        "sentiment_confidence": 0.80,
        "follow_up_suggestions": [
            "¿Quieres que revisemos tu plan para mañana?",
            "¿Te gustaría aprender más sobre meriendas saludables?",
            "¿Cómo te sientes ahora con tu progreso?"
        ]
    }
}
```

## 📊 Análisis de la Conversación

### **Estadísticas Generadas:**
- **Total de mensajes**: 4
- **Sentimiento promedio**: Neutral-Positivo
- **Confianza promedio**: 0.80
- **Tipos de consulta**: Nutricional, Emocional, Práctica

### **Contexto Utilizado:**
- ✅ Perfil del usuario (edad, peso, objetivos)
- ✅ Datos nutricionales del día
- ✅ Estado emocional actual (estrés 6/10)
- ✅ Historial de conversación

### **Sugerencias Generadas:**
- Opciones específicas de merienda
- Estrategias para manejar antojos
- Técnicas de manejo de estrés
- Instrucciones paso a paso

## 🎯 Beneficios del Sistema

### **Para el Usuario:**
1. **Respuestas contextuales** basadas en sus datos reales
2. **Apoyo emocional** reconociendo su estado de estrés
3. **Sugerencias prácticas** específicas para su situación
4. **Seguimiento continuo** de la conversación

### **Para el Sistema:**
1. **Aprendizaje continuo** de patrones del usuario
2. **Análisis de sentimiento** para intervenciones tempranas
3. **Datos valiosos** para mejorar el coaching
4. **Escalabilidad** para múltiples usuarios

## 🔄 Flujo Completo de Integración

```mermaid
graph TD
    A[Usuario envía mensaje] --> B[ChatController recibe]
    B --> C[GeminiService procesa]
    C --> D[Prepara contexto del usuario]
    D --> E[Envía a Gemini API]
    E --> F[Gemini genera respuesta]
    F --> G[Analiza sentimiento]
    G --> H[Genera sugerencias]
    H --> I[Guarda en ChatConversation]
    I --> J[Retorna respuesta al usuario]
```

## 🚀 Próximos Pasos

1. **Implementar en la app móvil** usando los endpoints creados
2. **Configurar notificaciones** basadas en sentimiento
3. **Integrar con sistema de alertas** existente
4. **Crear dashboard** de analytics de conversaciones
5. **Implementar recordatorios** inteligentes

---

**¡El sistema de chat con Gemini está completamente funcional y listo para revolucionar la experiencia de coaching nutricional!** 🎉
