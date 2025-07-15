; Script NSIS personalizado para forzar iconos en accesos directos
; Este archivo se incluye automáticamente en el instalador

!macro customInstall
  ; Forzar icono para el acceso directo del escritorio
  ${if} ${isUpdated}
    ; Durante actualización, recrear acceso directo con icono correcto
    Delete "$DESKTOP\Sistema de Gestion de Refacciones.lnk"
  ${endif}
  
  ; Crear acceso directo del escritorio con icono específico
  CreateShortCut "$DESKTOP\Sistema de Gestion de Refacciones.lnk" "$INSTDIR\Sistema de Gestion de Refacciones.exe" "" "$INSTDIR\Sistema de Gestion de Refacciones.exe" 0
  
  ; Crear acceso directo del menú inicio con icono específico
  CreateDirectory "$SMPROGRAMS\Herramientas Industriales"
  CreateShortCut "$SMPROGRAMS\Herramientas Industriales\Sistema de Gestion de Refacciones.lnk" "$INSTDIR\Sistema de Gestion de Refacciones.exe" "" "$INSTDIR\Sistema de Gestion de Refacciones.exe" 0
!macroend

!macro customUnInstall
  ; Limpiar accesos directos durante desinstalación
  Delete "$DESKTOP\Sistema de Gestion de Refacciones.lnk"
  Delete "$SMPROGRAMS\Herramientas Industriales\Sistema de Gestion de Refacciones.lnk"
  RMDir "$SMPROGRAMS\Herramientas Industriales"
!macroend
